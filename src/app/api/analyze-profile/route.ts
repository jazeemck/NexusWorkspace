import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callGemini, GEMINI_BUSY_MESSAGE } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in Production." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const content = formData.get("content") as string | null;
    const action = formData.get("action") as string || "extract-skills";

    if (file) {
      // ── Step 1: Build multimodal parts ───────────────────────────────────
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const aiParts: any[] = [
        { inlineData: { data: base64, mimeType: file.type } },
        { text: "This is a professional document (Resume/Profile). Please analyze it thoroughly." },
      ];

      if (action === "extract-skills") {
        aiParts.push({
          text: 'Assignment: Extract all technical and soft skills into a JSON array of strings. Return ONLY the raw JSON array. Example: ["React", "Accountant", "Excel"].',
        });
      } else {
        const role = formData.get("targetRole") as string || "the target role";
        aiParts.push({
          text: `Assignment: Write a world-class, high-density cover letter for ${role}. Tailor it intensely based on this resume. Follow the tone of a high-performance executive. Return ONLY raw JSON in this format: { "coverLetter": "string" }.`,
        });
      }

      // ── Step 2: Call Gemini with backoff + fallback ───────────────────────
      const { text: finalResult } = await callGemini({ parts: aiParts });

      return NextResponse.json({ result: finalResult });
    }

    // Text-only content path (cover letter from typed profile text)
    if (content) {
      const role = formData.get("targetRole") as string || "the target role";
      let prompt = "";

      if (action === "extract-skills") {
        prompt = `Extract all technical and soft skills from the following profile text into a JSON array of strings. Return ONLY the raw JSON array.\n\nProfile:\n${content}`;
      } else {
        prompt = `Write a world-class cover letter for ${role} based on the following profile. Return ONLY raw JSON: { "coverLetter": "string" }.\n\nProfile:\n${content}`;
      }

      const { text: finalResult } = await callGemini({ parts: [{ text: prompt }] });

      return NextResponse.json({ result: finalResult });
    }

    return NextResponse.json(
      { error: "Resume upload is currently required for precision matching." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("[JobSearch] CRITICAL FAILURE:", error);

    const isBusy =
      error.message === GEMINI_BUSY_MESSAGE ||
      error.message?.includes("429") ||
      error.message?.toLowerCase().includes("quota");

    if (isBusy) {
      return NextResponse.json(
        { error: "Our AI service is temporarily busy. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Analysis Pipeline Crashed.", details: error.message },
      { status: 500 }
    );
  }
}

