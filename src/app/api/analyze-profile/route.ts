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

    if (!file && !content) {
      return NextResponse.json({ error: "Empty profile payload." }, { status: 400 });
    }

    // ── Pre-Extraction ──────────────────────────────────────────────
    let promptText = "Analyze this resume/profile and provide professional structured insights.";
    if (action === "extract-skills") {
      promptText = `You are an expert recruiter. Extract a JSON array of all tech and soft skills. Return ONLY: ["React", "AI", ...]`;
    } else if (action === "gap-analysis") {
      promptText = `Compare profile to ${targetRole}. Identify missing skills. Return JSON: { "gaps": [], "matched": [], "confidence": 0, "recommendations": [] }`;
    } else if (action === "generate-cover-letter") {
      promptText = `Write a cover letter for ${targetRole}. Return JSON: { "coverLetter": "...", "tone": "professional" }`;
    }

    // ── Multi-Format Logic ──────────────────────────────────────────
    let aiParts: any[] = [];
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64File = buffer.toString("base64");
      
      // Try text extraction but keep multimodal fallback ready
      let extractedText = "";
      try {
        const pdf = require("pdf-parse");
        const pdfData = await pdf(buffer);
        extractedText = pdfData.text || "";
      } catch (e) {
        console.warn("[JobSearch] Manual PDF Parse failed, relying on Multimodal Nodes.");
      }

      if (extractedText.trim().length > 100) {
        aiParts = [{ text: `${promptText}\n\nRESUME CONTENT:\n${extractedText}` }];
      } else {
        // High-fidelity fallback for resume analysis
        aiParts = [
          { inlineData: { mimeType: file.type || "application/pdf", data: base64File } },
          { text: promptText },
        ];
      }
    } else {
      aiParts = [{ text: `${promptText}\n\nUSER PROFILE:\n${content}` }];
    }

    // ── Direct Stability Tunnel (V1 Production) ─────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in Production." }, { status: 500 });
    }

    const models = ["gemini-1.5-flash", "gemini-1.5-pro"];
    let finalResult = "";
    let lastErr: any;

    for (const mId of models) {
      try {
        console.log(`[JobSearch] stabilization Tunnel firing: ${mId}`);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mId}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: aiParts }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          finalResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (finalResult) break;
        } else {
          lastErr = await res.text();
          console.warn(`[JobSearch] Node ${mId} offline: ${lastErr}`);
        }
      } catch (e) {
        lastErr = e;
        continue;
      }
    }

    if (!finalResult) {
       return NextResponse.json({ error: "System nodes are temporarily offline. Check your Gemini API billing/quota.", details: lastErr }, { status: 502 });
    }

    return NextResponse.json({ result: finalResult });

  } catch (error: any) {
    console.error("[JobSearch] CRITICAL FAILURE:", error);
    return NextResponse.json({ error: "Analysis Pipeline Crashed.", details: error.message }, { status: 500 });
  }
}
