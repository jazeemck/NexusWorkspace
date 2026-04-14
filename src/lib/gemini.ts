/**
 * Shared Gemini API utility
 *
 * Strategy (serverless-safe):
 *  1. Try each model in GEMINI_MODEL_CHAIN once — no blocking sleeps.
 *  2. On 429 / 503, immediately move to the next model in the chain.
 *  3. A 10-second in-process cooldown prevents hammering a model that just
 *     returned 429. (Short window so users aren't locked out for long.)
 *  4. If every model is exhausted, throw GEMINI_BUSY_MESSAGE for callers to
 *     surface as a friendly UI error.
 *
 * Model configuration lives in @/lib/ai-config.ts.
 * Update the model name there — do NOT hardcode model strings here.
 */

import { GEMINI_MODEL_CHAIN, geminiUrl } from "@/lib/ai-config";

export const GEMINI_BUSY_MESSAGE =
  "Our AI service is temporarily busy. Please try again in a few minutes.";

// ---------- types ----------------------------------------------------------

export interface GeminiPart {
  text?: string;
  inlineData?: { data: string; mimeType: string };
}

export interface GeminiCallOptions {
  /** Parts that make up the single user turn. */
  parts: GeminiPart[];
  /** Override the default model chain (uses ai-config chain by default). */
  modelChain?: string[];
}

export interface GeminiResult {
  text: string;
  model: string;
}

// ---------- lightweight rate-limit signal (10 s window) --------------------

const rateLimitedAt = new Map<string, number>();
const SKIP_WINDOW_MS = 10_000;

function shouldSkipModel(modelId: string): boolean {
  const ts = rateLimitedAt.get(modelId);
  if (!ts) return false;
  return Date.now() - ts < SKIP_WINDOW_MS;
}

function recordRateLimit(modelId: string) {
  rateLimitedAt.set(modelId, Date.now());
}

// ---------- retryable status codes ----------------------------------------

const RETRYABLE_STATUSES = new Set([429, 503]);

// ---------- main exported function -----------------------------------------

/**
 * Call the Gemini generateContent REST API.
 *
 * Tries each model in `modelChain` once.  On 429 / 503 it immediately moves
 * to the next model without sleeping.  Throws GEMINI_BUSY_MESSAGE when all
 * models are exhausted.
 */
export async function callGemini(opts: GeminiCallOptions): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable.");

  const modelChain = opts.modelChain ?? GEMINI_MODEL_CHAIN;

  for (const modelId of modelChain) {
    if (shouldSkipModel(modelId)) {
      console.warn(`[Gemini] Skipping ${modelId} — rate-limited ${SKIP_WINDOW_MS / 1000}s ago.`);
      continue;
    }

    try {
      console.log(`[Gemini] Calling ${modelId}…`);

      const res = await fetch(geminiUrl(modelId, apiKey), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: opts.parts }] }),
      });

      // ── Success ──────────────────────────────────────────────────────────
      if (res.ok) {
        const data = await res.json();
        const text: string | undefined =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          console.log(`[Gemini] ✓ Success with ${modelId}`);
          return { text, model: modelId };
        }

        console.warn(`[Gemini] ${modelId} returned empty candidates. Trying next.`);
        continue;
      }

      // ── Rate-limited / temporarily unavailable ───────────────────────────
      const status = res.status;
      const body = await res.text().catch(() => "");

      if (RETRYABLE_STATUSES.has(status)) {
        console.warn(`[Gemini] ${modelId} → ${status}. Moving to fallback.`);
        if (status === 429) recordRateLimit(modelId);
        continue;
      }

      // ── Non-retryable (400, 401, 404, …) — fail immediately ──────────────
      console.error(`[Gemini] ${modelId} non-retryable ${status}: ${body.substring(0, 200)}`);
      throw new Error(`Gemini API error ${status}: ${body.substring(0, 200)}`);

    } catch (err: any) {
      if (
        err.message?.startsWith("Gemini API error") ||
        err.message?.startsWith("Missing GEMINI_API_KEY")
      ) {
        throw err;
      }
      console.error(`[Gemini] ${modelId} network error:`, err?.message);
      continue;
    }
  }

  console.error("[Gemini] All models exhausted.");
  throw new Error(GEMINI_BUSY_MESSAGE);
}
