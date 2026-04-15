import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GEMINI_BUSY_MESSAGE, GEMINI_QUOTA_MESSAGE } from "@/lib/gemini";
import { callAI } from "@/lib/ai-universal";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id || "anonymous";
    console.log(`[JobSearch] action: analyze-profile, userId: ${userId}`);

    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
      console.error("[JobSearch] No AI API keys found.");
      return NextResponse.json({ error: "No AI service configured (Missing API Keys)." }, { status: 500 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      console.error("[JobSearch] FormData Parse Error:", err);
      return NextResponse.json({ error: "Failed to parse form data." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    const content = formData.get("content") as string | null;
    const action = (formData.get("action") as string) || "extract-skills";

    console.log(`[JobSearch] File present: ${!!file}, fileName: ${file?.name}, mimeType: ${file?.type}`);

    if (file) {
      const buffer = await file.arrayBuffer();
      const mimeType = file.type || "application/pdf";
      const fileName = file.name.toLowerCase();
      
      const aiParts: any[] = [];
      let textContent = "";

      // ── Step 1: Attempt Text Extraction (Save tokens + Groq compatibility) ──
      try {
        if (fileName.endsWith(".pdf") || mimeType === "application/pdf") {
          console.log("[JobSearch] Attempting server-side PDF text extraction...");
          // Dynamic require to prevent initialization crashes in some environments
          const pdfExtract = require("pdf-parse");
          const data = await pdfExtract(Buffer.from(buffer));
          textContent = data.text || "";
          console.log(`[JobSearch] PDF extracted: ${textContent.length} chars`);
        } else if (fileName.endsWith(".txt") || mimeType === "text/plain") {
          textContent = Buffer.from(buffer).toString("utf-8");
        }
      } catch (extractErr) {
        console.warn("[JobSearch] Text extraction failed, falling back to base64.", extractErr);
      }

      if (textContent && textContent.trim().length > 50) {
        aiParts.push({ text: `Attached Document Content:\n\n${textContent}` });
      } else {
        // Fallback to Base64 for Gemini if extraction failed (Groq won't see this)
        const base64 = Buffer.from(buffer).toString("base64");
        aiParts.push({ inlineData: { data: base64, mimeType } });
      }

      aiParts.push({ text: "Please analyze the professional document provided above." });

      if (action === "extract-skills") {
        aiParts.push({
          text: 'Assignment: Extract all technical and soft skills into a JSON array of strings. Return ONLY the raw JSON array. Example: ["React", "Accountant", "Excel"].',
        });
      } else {
        const role = (formData.get("targetRole") as string) || "the target role";
        aiParts.push({
          text: `Assignment: Write a world-class, high-density cover letter for ${role}. Tailor it intensely based on this resume. Return ONLY raw JSON in this format: { "coverLetter": "string" }.`,
        });
      }

      console.log("[JobSearch] Calling Universal AI Engine...");
      const finalResult = await callAI({ parts: aiParts });
      return NextResponse.json({ result: finalResult.text, provider: finalResult.provider });
    }

    // Text-only content path
    if (content) {
      const role = (formData.get("targetRole") as string) || "the target role";
      let prompt = "";

      if (action === "extract-skills") {
        prompt = `Extract all technical and soft skills from the following profile text into a JSON array of strings. Return ONLY the raw JSON array.\n\nProfile:\n${content}`;
      } else {
        prompt = `Write a world-class cover letter for ${role} based on the following profile. Return ONLY raw JSON: { "coverLetter": "string" }.\n\nProfile:\n${content}`;
      }

      console.log("[JobSearch] Calling Universal AI (text-only)...");
      const finalResult = await callAI({ parts: [{ text: prompt }] });
      return NextResponse.json({ result: finalResult.text, provider: finalResult.provider });
    }

    return NextResponse.json({ error: "No profile data provided." }, { status: 400 });

  } catch (error: any) {
    console.error("[JobSearch] CRITICAL FAILURE:", error);

    if (error.message === GEMINI_QUOTA_MESSAGE) {
      return NextResponse.json(
        { error: "AI quota reached for all providers. Please try again tomorrow." },
        { status: 429 }
      );
    }

    if (error.message === GEMINI_BUSY_MESSAGE || error.message?.includes("429")) {
      return NextResponse.json({ error: "AI service is busy. Please retry in a few seconds." }, { status: 429 });
    }

    return NextResponse.json({ error: "Analysis Pipeline Crashed.", details: error.message }, { status: 500 });
  }
}
