/**
 * Shared Gemini API utility
 *
 * Strategy (serverless-safe):
 *  1. Build a list of API keys: [GEMINI_API_KEY, GEMINI_API_KEY_BACKUP?]
 *  2. For each key, try every model in GEMINI_MODEL_CHAIN once (no sleeps).
 *  3. On 429 / 503, immediately move to the next model; if all models on
 *     the current key are exhausted with 429, switch to the backup key.
 *  4. A 10-second in-process cooldown avoids hammering the same
 *     (key × model) combination that just returned 429.
 *  5. If every key + model combination is exhausted, throw
 *     GEMINI_QUOTA_MESSAGE so callers can show a friendly UI error.
 *
 * Model configuration lives in @/lib/ai-config.ts.
 * Do NOT hardcode model strings here.
 */

import { GEMINI_MODEL_CHAIN, geminiUrl } from "@/lib/ai-config";

/** Thrown when the request can't be processed but the user should retry. */
export const GEMINI_BUSY_MESSAGE =
  "Our AI service is temporarily busy. Please try again in a few minutes.";

/** Thrown when all API keys and models are exhausted (free quota fully used). */
export const GEMINI_QUOTA_MESSAGE =
  "Free AI quota reached. Please try again tomorrow or contact support.";

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
  /** Expected response MIME type (e.g. 'application/json') */
  responseMimeType?: string;
}

export interface GeminiResult {
  text: string;
  model: string;
  keyUsed: "primary" | "backup";
}

// ---------- per-key-per-model rate-limit signal (10 s window) --------------
// Cache key format: "<apiKeyPrefix>|<modelId>"

const rateLimitedAt = new Map<string, number>();
const SKIP_WINDOW_MS = 10_000;

function cacheKey(apiKey: string, modelId: string) {
  // Use only the last 6 chars of the key as identifier (avoid logging secrets)
  return `${apiKey.slice(-6)}|${modelId}`;
}

function shouldSkip(apiKey: string, modelId: string): boolean {
  const ts = rateLimitedAt.get(cacheKey(apiKey, modelId));
  if (!ts) return false;
  return Date.now() - ts < SKIP_WINDOW_MS;
}

function recordRateLimit(apiKey: string, modelId: string) {
  rateLimitedAt.set(cacheKey(apiKey, modelId), Date.now());
}

// ---------- retryable status codes ----------------------------------------

const RETRYABLE_STATUSES = new Set([429, 503]);

// ---------- main exported function -----------------------------------------

/**
 * Call the Gemini generateContent REST API.
 *
 * Key rotation: tries the primary key (GEMINI_API_KEY) first.  If all
 * models on that key return 429/503, automatically switches to the backup
 * key (GEMINI_API_KEY_BACKUP) if one is configured.
 *
 * Throws GEMINI_QUOTA_MESSAGE when all keys and models are exhausted.
 */
export async function callGemini(opts: GeminiCallOptions): Promise<GeminiResult> {
  const primaryKey = process.env.GEMINI_API_KEY;
  const backupKey  = process.env.GEMINI_API_KEY_BACKUP;

  if (!primaryKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable.");
  }

  // Build the key list — backup is optional
  const apiKeys: Array<{ key: string; label: "primary" | "backup" }> = [
    { key: primaryKey, label: "primary" },
    ...(backupKey ? [{ key: backupKey, label: "backup" as const }] : []),
  ];

  const modelChain = opts.modelChain ?? GEMINI_MODEL_CHAIN;

  for (const { key: apiKey, label: keyLabel } of apiKeys) {
    console.log(`[Gemini] Trying ${keyLabel} key…`);
    let anyModelWorked = false; // track if at least one attempt was non-429

    for (const modelId of modelChain) {
      if (shouldSkip(apiKey, modelId)) {
        console.warn(`[Gemini] Skipping ${modelId} (${keyLabel}) — rate-limited recently.`);
        continue;
      }

      try {
        console.log(`[Gemini] ${keyLabel}/${modelId} — calling…`);

        const res = await fetch(geminiUrl(modelId, apiKey), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            contents: [{ parts: opts.parts }],
            generationConfig: opts.responseMimeType ? {
              response_mime_type: opts.responseMimeType
            } : undefined
          }),
        });

        // ── Success ────────────────────────────────────────────────────────
        if (res.ok) {
          const data = await res.json();
          const text: string | undefined =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

          if (text) {
            console.log(`[Gemini] ✓ Success — ${keyLabel}/${modelId}`);
            return { text, model: modelId, keyUsed: keyLabel };
          }

          console.warn(`[Gemini] ${keyLabel}/${modelId} returned empty candidates.`);
          anyModelWorked = true; // got a 200, just no content
          continue;
        }

        // ── Rate-limited / temporarily unavailable ─────────────────────────
        const status = res.status;
        await res.text().catch(() => ""); // drain body

        if (RETRYABLE_STATUSES.has(status)) {
          console.warn(`[Gemini] ${keyLabel}/${modelId} → ${status}.`);
          if (status === 429) recordRateLimit(apiKey, modelId);
          continue; // try next model on this key
        }

        // ── Non-retryable (400, 401, 404, …) ──────────────────────────────
        const errBody = await res.clone().text().catch(() => "");
        console.error(`[Gemini] ${keyLabel}/${modelId} non-retryable ${status}: ${errBody.substring(0, 200)}`);
        throw new Error(`Gemini API error ${status}: ${errBody.substring(0, 200)}`);

      } catch (err: any) {
        if (
          err.message?.startsWith("Gemini API error") ||
          err.message?.startsWith("Missing GEMINI_API_KEY")
        ) {
          throw err; // re-throw typed errors
        }
        console.error(`[Gemini] ${keyLabel}/${modelId} network error:`, err?.message);
        continue;
      }
    }

    // If every model on this key returned 429, move to backup key.
    console.warn(`[Gemini] All models exhausted on ${keyLabel} key.`);
  }

  // Every key and model combination failed.
  console.warn("[Gemini] All API keys and models exhausted.");
  throw new Error(GEMINI_QUOTA_MESSAGE);
}
