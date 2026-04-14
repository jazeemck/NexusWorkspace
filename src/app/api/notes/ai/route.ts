import { NextRequest, NextResponse } from "next/server";
import { callGemini, GEMINI_BUSY_MESSAGE, GEMINI_QUOTA_MESSAGE } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { action, content, title } = await req.json();

    if (!action || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    const { text } = await callGemini({ parts: [{ text: prompt }] });

    return NextResponse.json({ result: text });
  } catch (err: any) {
    console.error("[Notes AI] Error:", err);

    if (err.message === GEMINI_QUOTA_MESSAGE) {
      return NextResponse.json(
        { error: "Free AI quota reached. Please try again tomorrow or contact support." },
        { status: 429 }
      );
    }

    const isBusy = err.message === GEMINI_BUSY_MESSAGE
      || err.message?.includes("429")
      || err.message?.toLowerCase().includes("quota");

    if (isBusy) {
      return NextResponse.json(
        { error: "Our AI service is temporarily busy. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    if (err.message?.toLowerCase().includes("safety")) {
      return NextResponse.json(
        { error: "This request was declined by AI safety filters." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Intelligence node connection timed out." },
      { status: 500 }
    );
  }
}

