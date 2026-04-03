import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in Production." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const content = formData.get("content") as string | null;
    const action = formData.get("action") as string || "extract-skills";

    if (file) {
      // ── Step 1: Multimodal Extraction ──────────────────────────────────────────
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      
      const aiParts = [
        { inlineData: { data: base64, mimeType: file.type } },
        { text: "This is a professional document (Resume/Profile). Please analyze it thoroughly." }
      ];

      if (action === "extract-skills") {
        aiParts.push({ text: "Assignment: Extract all technical and soft skills into a JSON array of strings. Return ONLY the raw JSON array. Example: [\"React\", \"Accountant\", \"Excel\"]." });
      } else {
        const role = formData.get("targetRole") as string || "the target role";
        aiParts.push({ text: `Assignment: Write a world-class, high-density cover letter for ${role}. Tailor it intensely based on this resume. Follow the tone of a high-performance executive. Return ONLY raw JSON in this format: { \"coverLetter\": \"string\" }.` });
      }

      // ── Phase 2: Elite Intelligence Discovery (Synchronized with Radar) ──────────
      // Based on Radar Tape: your elite account uses 'gemini-2.5-flash' and 'gemini-2.0-flash'.
      const potentialModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let finalResult = "";
      let lastErr: any;

      for (const modelId of potentialModels) {
        if (finalResult) break;
        
        try {
          console.log(`[JobSearch] Intelligence Discovery: Probing Elite Node ${modelId} at v1beta`);
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: aiParts }]
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              finalResult = text;
              console.log(`[JobSearch] Elite Target Locked: Successfully used ${modelId}`);
              break;
            }
          } else {
            lastErr = await res.text();
            console.warn(`[JobSearch] Elite Node ${modelId} unreachable: ${lastErr.substring(0, 50)}...`);
          }
        } catch (e) {
          lastErr = e;
          continue;
        }
      }

      if (!finalResult) {
         return NextResponse.json({ error: "System nodes are temporarily offline. Your future-gen account quota may be restricted.", details: lastErr }, { status: 502 });
      }

      return NextResponse.json({ result: finalResult });
    }

    return NextResponse.json({ error: "Resume upload is currently required for precision matching." }, { status: 400 });

  } catch (error: any) {
    console.error("[JobSearch] CRITICAL FAILURE:", error);
    return NextResponse.json({ error: "Analysis Pipeline Crashed.", details: error.message }, { status: 500 });
  }
}
