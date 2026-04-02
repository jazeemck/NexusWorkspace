import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with API Key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const content = formData.get("content") as string | null;
    const action = (formData.get("action") as string) || "extract-skills";
    const targetRole = (formData.get("targetRole") as string) || "";

    // 1. Validation: Ensure we have something to analyze
    if (!file && !content) {
      return NextResponse.json(
        { error: "No file or profile content provided" },
        { status: 400 }
      );
    }

    // 3. Prepare Prompt based on action
    let promptText = "Analyze this resume/profile and provide professional structured insights.";
    
    if (action === "extract-skills") {
      promptText = `
        You are an expert technical recruiter and AI resume parser. 
        Analyze the provided content and extract a JSON array of all relevant tech and soft skills.
        Be thorough - extract specific technologies, methodologies, and professional domains.
        Return ONLY a pure JSON array of strings: ["React", "AI Engineering", "Product Strategy", ...]
      `;
    } else if (action === "gap-analysis") {
      promptText = `
        Compare the user's profile against the requirements for a ${targetRole}.
        Identify missing key skills and overlapping strengths.
        Return a JSON object with: { "gaps": [], "matched": [], "confidence": 0, "recommendations": [] }
      `;
    } else if (action === "generate-cover-letter") {
      promptText = `
        You are a highly skilled career coach. 
        Write a persuasive, sophisticated, and personalized cover letter for the role: ${targetRole}.
        Use the provided profile/resume content to highlight relevant experience that matches this specific role.
        Return ONLY a JSON object with: { "coverLetter": "The full text of the letter here...", "tone": "professional" }
      `;
    }

    // 4. Handle Content (File vs Raw Text)
    let aiInput: any[] = [];
    
    if (file) {
      console.log(`[JobSearch] Processing file: ${file.name}, type: ${file.type}`);
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        try {
          console.log("[JobSearch] Attempting text extraction from PDF...");
          // Dynamic require to avoid issues with standard ESM bundling of Node.js modules in some environments
          const pdf = require("pdf-parse");
          const pdfData = await pdf(buffer);
          
          if (pdfData.text && pdfData.text.trim().length > 50) {
            aiInput = [
              { text: `${promptText}\n\nResume Content (Extracted):\n${pdfData.text}` }
            ];
            console.log("[JobSearch] Text extraction success - using text mode.");
          } else {
            throw new Error("Extraction empty or too short");
          }
        } catch (parseErr: any) {
          console.warn("[JobSearch] PDF Text Extraction failed, using multimodal fallback:", parseErr.message);
          const base64File = buffer.toString("base64");
          aiInput = [
            { inlineData: { mimeType: "application/pdf", data: base64File } },
            { text: promptText },
          ];
        }
      } else if (file.type.startsWith("text/") || file.name.toLowerCase().endsWith(".txt")) {
        const text = await file.text();
        aiInput = [
          { text: `${promptText}\n\nResume/Profile Content:\n${text}` }
        ];
      } else if (file.name.toLowerCase().endsWith(".docx")) {
        // Direct DOCX - improving the message to suggest copy-paste
        return NextResponse.json(
          { error: "Direct DOCX processing is currently unavailable. Please export your resume to PDF or copy-paste the text directly into the profile calibration area below." },
          { status: 400 }
        );
      } else {
        // Fallback: try reading as text
        try {
          const text = await file.text();
          aiInput = [
            { text: `${promptText}\n\nResume/Profile Content:\n${text}` }
          ];
        } catch {
          return NextResponse.json(
            { error: "Unsupported file type. Please use PDF or plain text (.txt)." },
            { status: 400 }
          );
        }
      }
    } else {
      // Process direct text input
      aiInput = [
        { text: `${promptText}\n\nContent to analyze:\n${content}` }
      ];
    }

    // 5. Execute Gemini Analysis with Model Fallback
    const models = [
      "gemini-2.0-flash", 
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.0-flash-lite-preview-02-05",
      "gemini-1.5-pro",
    ];
    
    let lastError: any;

    for (const modelName of models) {
        try {
            console.log(`[JobSearch] Attempting analysis with model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json" }
            });

            const result = await model.generateContent(aiInput);
            const response = await result.response;
            
            // Safety check
            if (response.promptFeedback?.blockReason) {
                console.warn(`[JobSearch] Content blocked by ${modelName}:`, response.promptFeedback.blockReason);
                continue; // Try next model
            }

            const text = response.text();
            if (!text) throw new Error("Empty response from AI");
            
            return NextResponse.json({ result: text });
        } catch (aiError: any) {
            lastError = aiError;
            const errorMsg = aiError.message || String(aiError);
            console.warn(`[JobSearch] Model ${modelName} failed:`, errorMsg);
            
            // If it's a 429 quota error, we specifically want to log it but maybe try next model
            // as some models might have different quotas.
            if (errorMsg.includes("429") || errorMsg.includes("quota")) {
                console.error(`[JobSearch] Quota exceeded for ${modelName}`);
            }
            continue;
        }
    }

    // If we reach here, all models failed
    const finalErrorMessage = lastError?.message || "All intelligence nodes failed to process the request.";
    
    if (finalErrorMessage.includes("429") || finalErrorMessage.toLowerCase().includes("quota")) {
      return NextResponse.json(
        { error: "Intelligence Quota Exceeded. Our AI nodes are currently at capacity. Please try again in 60 seconds.", details: finalErrorMessage },
        { status: 429 }
      );
    }

    throw lastError || new Error("All intelligence nodes failed to process the request.");

  } catch (error: any) {
    console.error("ANALYSIS ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Intelligence node processing failed", details: error.message },
      { status: 500 }
    );
  }
}
