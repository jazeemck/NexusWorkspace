/**
 * Shared Gemini API utility
 * - Model fallback chain:  gemini-2.0-flash → gemini-1.5-flash-8b
 * - Exponential backoff:   5 s → 15 s → 30 s  (429 / 503 only)
 * - In-process rate-limit cache: 60-second cooldown per model
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
  /** Maximum retries per model (default 3). */
  maxRetries?: number;
}

export interface GeminiResult {
  text: string;
  model: string;
}

// ---------- in-process rate-limit cache ------------------------------------
// Maps modelId → timestamp (ms) when the last 429 was received.

const rateLimitCache = new Map<string, number>();
const RATE_LIMIT_COOLDOWN_MS = 60_000; // 60 seconds

function isRateLimited(modelId: string): boolean {
  const ts = rateLimitCache.get(modelId);
  if (!ts) return false;
  return Date.now() - ts < RATE_LIMIT_COOLDOWN_MS;
}

function markRateLimited(modelId: string) {
  rateLimitCache.set(modelId, Date.now());
}

// ---------- sleep helper ---------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- main exported function -----------------------------------------

const DEFAULT_MODEL_CHAIN = ["gemini-2.0-flash", "gemini-1.5-flash-8b"];
const RETRY_DELAYS_MS = [5_000, 15_000, 30_000]; // delays between retries
const RETRYABLE_STATUSES = new Set([429, 503]);

/**
 * Call the Gemini generateContent REST API with automatic retry +
 * model fallback.
 *
 * Throws an error whose `message` equals GEMINI_BUSY_MESSAGE when all
 * models are exhausted so callers can surface it directly to the user.
 */
export async function callGemini(opts: GeminiCallOptions): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable.");

  const modelChain = opts.modelChain ?? DEFAULT_MODEL_CHAIN;
  const maxRetries = opts.maxRetries ?? 3;

  for (const modelId of modelChain) {
    // Fast-fail if this model is still in its cooldown window.
    if (isRateLimited(modelId)) {
      console.warn(`[Gemini] ${modelId} is rate-limited (cooldown active). Skipping.`);
      continue;
    }

    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        console.log(`[Gemini] ${modelId} — attempt ${attempt + 1}/${maxRetries + 1}`);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: opts.parts }] }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text: string | undefined =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            console.log(`[Gemini] Success with ${modelId}`);
            return { text, model: modelId };
          }

          // Empty response — treat as a soft failure, break to next model.
          console.warn(`[Gemini] ${modelId} returned empty candidates.`);
          break;
        }

        // ---------- non-OK response ----------------------------------------
        const status = res.status;
        const body = await res.text();

        if (RETRYABLE_STATUSES.has(status)) {
          if (status === 429) markRateLimited(modelId);

          if (attempt < maxRetries) {
            const delay = RETRY_DELAYS_MS[attempt] ?? 30_000;
            console.warn(
              `[Gemini] ${modelId} returned ${status}. Retrying in ${delay / 1000}s… (${attempt + 1}/${maxRetries})`
            );
            await sleep(delay);
            attempt++;
            continue;
          }

          // Exhausted retries on this model → try the next one.
          console.warn(`[Gemini] ${modelId} exhausted retries after ${status}.`);
          break;
        }

        // Non-retryable error (4xx other than 429) — surface immediately.
        console.error(`[Gemini] ${modelId} non-retryable error ${status}: ${body.substring(0, 120)}`);
        throw new Error(`Gemini API error ${status}: ${body.substring(0, 120)}`);

      } catch (err: any) {
        // Network / JSON errors — treat as transient if retries remain.
        if (attempt < maxRetries) {
          const delay = RETRY_DELAYS_MS[attempt] ?? 30_000;
          console.warn(`[Gemini] ${modelId} network error. Retrying in ${delay / 1000}s…`, err?.message);
          await sleep(delay);
          attempt++;
          continue;
        }
        console.error(`[Gemini] ${modelId} exhausted retries after network error.`, err?.message);
        break;
      }
    }
  }

  // All models exhausted.
  throw new Error(GEMINI_BUSY_MESSAGE);
}
