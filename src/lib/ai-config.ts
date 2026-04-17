/**
 * Central AI model configuration.
 *
 * ALL Gemini model references in this codebase must use these constants.
 * To change the model globally, update only this file.
 *
 * Confirmed available on the v1beta endpoint (2026-04):
 *   - gemini-2.0-flash  ✅ primary
 *
 * DO NOT use these — they return 404 on v1beta:
 *   - gemini-1.5-flash   ❌
 *   - gemini-1.5-flash-8b ❌
 *   - gemini-1.5-pro     ❌
 *   - gemini-1.0-pro     ❌
 *   - gemini-pro         ❌
 */

/** The single model used for all Gemini API calls in this application. */
export const GEMINI_MODEL = "gemini-2.0-flash";

/** Groq endpoint configuration */
export const GROQ_MODEL = "llama-3.3-70b-versatile";

/** 
 * Ordered list of models to try.
 * If the primary returns 429/503, the next one is attempted immediately.
 */
export const GEMINI_MODEL_CHAIN: string[] = [
  GEMINI_MODEL,
  "gemini-1.5-flash"
];

/** Gemini REST API version in use. */
export const GEMINI_API_VERSION = "v1beta";

/** Base URL for Gemini generateContent calls. */
export function geminiUrl(modelId: string, apiKey: string): string {
  return `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${modelId}:generateContent?key=${apiKey}`;
}

/** Base URL for Groq chat completions. */
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
