import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { action, content, title } = await req.json();

    if (!action || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const models = ["gemini-2.0-flash"];
    let lastError: any;
    let text = "";
    let success = false;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        let prompt = "";
        
        if (action === "suggest_title") {
          prompt = `Based on the following note content, suggest a concise and professional title (max 6 words). Return ONLY the title text, nothing else.\n\nContent:\n${content}`;
        } else if (action === "summarize") {
          prompt = `Analyze the following note content and generate a 3-5 line summary. Focus on the main points and actionable insights. Return ONLY the summary text.\n\nContent:\n${content}`;
        } else if (action === "refine") {
          prompt = `Refine and optimize the following note content for clarity, professional tone, and better structure. Maintain the original meaning but improve the writing quality significantly. Return ONLY the refined content text.\n\nContent:\n${content}`;
        } else if (action === "bullet_points") {
          prompt = `Transform the following note content into a clear, structured list of bullet points. Simplify and organize the information. Return ONLY the bullet points as a markdown list.\n\n${title ? `Note Title: ${title}\n` : ""}Content:\n${content}`;
        } else {
          return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }

    if (!success) {
      const errorMsg = lastError?.message || "All intelligence nodes failed to process the request.";
      
      if (errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
        return NextResponse.json(
          { error: "AI Intelligence limits reached. Please wait a few moments before trying again." },
          { status: 429 }
        );
      }
      
      if (errorMsg.toLowerCase().includes("safety")) {
        return NextResponse.json(
          { error: "This request was declined by AI safety filters." },
          { status: 400 }
        );
      }

      throw lastError || new Error("Intelligence node synthesis failed.");
    }

    return NextResponse.json({ result: text });
  } catch (err: any) {
    console.error("AI Action API error:", err);
    return NextResponse.json(
      { error: err.message || "Intelligence node connection timed out." },
      { status: 500 }
    );
  }
}
