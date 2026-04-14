/**
 * Shared Gemini API utility
 *
 * Strategy (serverless-safe):
 *  1. Try each model in the chain once — no blocking sleeps between attempts.
 *  2. On 429 / 503, immediately move to the next model in the chain.
 *  3. A lightweight in-process cache records the last 429 timestamp per model.
 *     If a model got a 429 within the last 10 s, skip it (avoid hammering).
 *     10 s is intentionally short so it doesn't lock users out for a long time.
 *  4. If every model is exhausted, throw GEMINI_BUSY_MESSAGE for callers to
 *     surface as a friendly UI error.
 *
 * NOTE: Server-side sleep/backoff is deliberately omitted — serverless
 * functions (Vercel, etc.) have strict execution time limits and sleeping
 * for 5-30 s will cause request timeouts.  Client-side retry (e.g. toast +
 * "try again" button) is the correct pattern for rate-limit recovery.
 */

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
  /** Override the default model chain. */
  modelChain?: string[];
}

export interface GeminiResult {
  text: string;
  model: string;
}

// ---------- lightweight rate-limit signal (10 s window) --------------------
// Maps modelId → timestamp (ms) of the last 429 received.
// Only used to avoid re-hitting a model that JUST returned 429 on this
// server instance.  In serverless each cold-start begins fresh anyway.

const rateLimitedAt = new Map<string, number>();
const SKIP_WINDOW_MS = 10_000; // 10 seconds

function shouldSkipModel(modelId: string): boolean {
  const ts = rateLimitedAt.get(modelId);
  if (!ts) return false;
  return Date.now() - ts < SKIP_WINDOW_MS;
}

function recordRateLimit(modelId: string) {
  rateLimitedAt.set(modelId, Date.now());
}

// ---------- default model chain --------------------------------------------

const DEFAULT_MODEL_CHAIN = ["gemini-2.0-flash", "gemini-1.5-flash-8b"];
const RETRYABLE_STATUSES = new Set([429, 503]);

// ---------- main exported function -----------------------------------------

/**
 * Call the Gemini generateContent REST API.
 *
 * Tries each model in `modelChain` once.  On 429 / 503 it immediately moves
 * to the next model without sleeping.  Throws `GEMINI_BUSY_MESSAGE` when all
 * models are exhausted.
 */
export async function callGemini(opts: GeminiCallOptions): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable.");

  const modelChain = opts.modelChain ?? DEFAULT_MODEL_CHAIN;

  for (const modelId of modelChain) {
    // Skip models that very recently returned 429 on this instance.
    if (shouldSkipModel(modelId)) {
      console.warn(`[Gemini] Skipping ${modelId} — rate-limited ${SKIP_WINDOW_MS / 1000}s ago.`);
      continue;
    }

    try {
      console.log(`[Gemini] Calling ${modelId}…`);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: opts.parts }] }),
        }
      );

      // ── Success ──────────────────────────────────────────────────────────
      if (res.ok) {
        const data = await res.json();
        const text: string | undefined =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          console.log(`[Gemini] ✓ Success with ${modelId}`);
          return { text, model: modelId };
        }

        // Empty candidates — try the next model.
        console.warn(`[Gemini] ${modelId} returned empty candidates. Trying next model.`);
        continue;
      }

      // ── Rate-limited or temporarily unavailable ──────────────────────────
      const status = res.status;
      const body = await res.text().catch(() => "");

      if (RETRYABLE_STATUSES.has(status)) {
        console.warn(`[Gemini] ${modelId} → ${status}. Moving to fallback model.`);
        if (status === 429) recordRateLimit(modelId);
        continue; // try next model immediately — no sleep
      }

      // ── Non-retryable error (e.g. 400 bad request, 401 auth) ─────────────
      console.error(`[Gemini] ${modelId} non-retryable ${status}: ${body.substring(0, 120)}`);
      throw new Error(`Gemini API error ${status}: ${body.substring(0, 120)}`);

    } catch (err: any) {
      // Re-throw typed errors (non-retryable ones from the block above).
      if (err.message?.startsWith("Gemini API error") || err.message?.startsWith("Missing GEMINI_API_KEY")) {
        throw err;
      }
      // Network / fetch error — log and try the next model.
      console.error(`[Gemini] ${modelId} network error:`, err?.message);
      continue;
    }
  }

  // All models in the chain were exhausted.
  console.error("[Gemini] All models exhausted.");
  throw new Error(GEMINI_BUSY_MESSAGE);
}
