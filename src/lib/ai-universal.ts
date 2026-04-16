/**
 * Universal AI Caller with Fallback Support
 * 
 * Logic:
 * 1. Tries Gemini (Primary Key)
 * 2. Tries Gemini (Backup Key if exists)
 * 3. Tries Groq (Fallback if Gemini fails with 429 quota)
 */

import { callGemini, GeminiCallOptions, GeminiResult, GEMINI_QUOTA_MESSAGE } from "./gemini";
import { GROQ_API_URL, GROQ_MODEL } from "./ai-config";

export interface AIResult extends GeminiResult {
  provider: "gemini" | "groq";
}

export async function callAI(opts: GeminiCallOptions & { responseMimeType?: string }): Promise<AIResult> {
  try {
    // ── Attempt 1: Gemini (Handles key rotation internally) ───────────────
    const geminiRes = await callGemini(opts);
    return { ...geminiRes, provider: "gemini" };

  } catch (err: any) {
    // Only fall back to Groq if the error is a Quota/429 error
    const isQuotaError = 
      err.message === GEMINI_QUOTA_MESSAGE || 
      err.message?.includes("429") || 
      err.message?.toLowerCase().includes("quota");

    if (!isQuotaError || !process.env.GROQ_API_KEY) {
      throw err; // Re-throw if it's not a quota issue or we don't have Groq
    }

    console.warn("[AI-Universal] Gemini Quota hit. Falling back to Groq...");

    // ── Attempt 2: Groq Fallback ──────────────────────────────────────────
    // Groq doesn't support multimodal (images) in their standard models.
    // If we have inlineData, we try to convert it to a description or skip it.
    
    let textPrompt = "";
    for (const part of opts.parts) {
      if (part.text) {
        textPrompt += part.text + "\n";
      } else if (part.inlineData) {
        textPrompt += "[Attached Document/Image Content - Multimodal not supported by fallback engine]\n";
      }
    }

    try {
      const groqRes = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [{ role: "user", content: textPrompt }],
            temperature: 0.1, 
            response_format: opts.responseMimeType === "application/json" ? { type: "json_object" } : undefined
          }),
      });

      if (!groqRes.ok) {
        const errorBody = await groqRes.text();
        console.error(`[Groq] API Error: ${groqRes.status} - ${errorBody}`);
        throw new Error(`Groq API error ${groqRes.status}`);
      }

      const data = await groqRes.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) throw new Error("Groq returned empty response");

      console.log("[Groq] ✓ Success (Fallback)");
      return {
        text,
        model: GROQ_MODEL,
        keyUsed: "primary", // Groq assumes primary
        provider: "groq"
      };

    } catch (groqErr: any) {
      console.error("[Groq] Critical fallback failure:", groqErr);
      throw err; // Throw the original Gemini quota error if Groq also fails
    }
  }
}
