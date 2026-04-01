import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidYouTubeUrl, extractVideoId, getThumbnailUrl } from "@/lib/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { YoutubeTranscript } from 'youtube-transcript';

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface FirecrawlResponse {
  success: boolean;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    ogTitle?: string;
  };
  error?: string;
}

interface GeminiResult {
  intelligentSummary: string;
  timelineSummary: Array<{
    timestamp: string;
    title: string;
    description: string;
  }>;
}

async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResponse> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, formats: ["markdown"] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firecrawl HTTP ${res.status}: ${err}`);
  }
  return res.json() as Promise<FirecrawlResponse>;
}

async function getYoutubeDuration(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      next: { revalidate: 3600 } 
    });
    const html = await res.text();
    
    // Look for approximateDurationMs
    const match = html.match(/"approxDurationMs":"(\d+)"/);
    if (match) return Math.floor(parseInt(match[1]) / 1000);
    
    // Look for duration string PT...
    const durationMatch = html.match(/"duration":"PT(\d+H)?(\d+M)?(\d+S)?"/);
    if (durationMatch) {
      let totalSeconds = 0;
      if (durationMatch[1]) totalSeconds += parseInt(durationMatch[1]) * 3600;
      if (durationMatch[2]) totalSeconds += parseInt(durationMatch[2]) * 60;
      if (durationMatch[3]) totalSeconds += parseInt(durationMatch[3]);
      return totalSeconds;
    }
    return null;
  } catch (e) {
    console.error("Error fetching duration:", e);
    return null;
  }
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

async function analyzeWithGemini(content: string, videoTitle: string, targetLanguage: string, category: string, durationSeconds: number | null): Promise<GeminiResult> {
  // Use Gemini 2.5/2.0 models as they have higher availability and performance in this region
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
  const durationText = durationSeconds ? formatDuration(durationSeconds) : "Unknown";
  let lastError: any;

  for (const modelName of models) {
    try {
      console.log(`[AI] Attempting intelligence synthesis with ${modelName} for: "${videoTitle}"`);
      const systemPrompt = `You are a world-class YouTube intelligence analyst. Your objective is to synthesize complex video transcripts into high-density, structured JSON data. You must produce content-rich responses based strictly on the provided transcript.`;

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.1 // Lower temperature for more stable JSON output
        }
      });

      const prompt = `CONTENT SOURCE: YouTube Video Transcript
VIDEO TITLE: ${videoTitle}
VIDEO DURATION: ${durationText}
TARGET LANGUAGE: ${targetLanguage}
CATEGORY: ${category}

TRANSCRIPT CONTENT:
---
${content}
---

ASSIGNMENT:
Generate a high-fidelity intelligence report in ${targetLanguage} following this JSON schema:
1. "intelligentSummary": A 3-5 paragraph deep-dive into the core thesis, supporting arguments, and expert insights found in the transcript.
2. "timelineSummary": A chronological mapping (8-12 segments) with timestamps (e.g. "0:00", "5:20"), high-impact titles, and single-sentence executive descriptions.

SCHEMA:
{
  "intelligentSummary": "string",
  "timelineSummary": [
    { "timestamp": "string", "title": "string", "description": "string" }
  ]
}

Return ONLY the raw JSON object. No markdown formatting, no preamble.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      try {
        const parsed = JSON.parse(text) as GeminiResult;
        console.log(`[AI] Intelligence synthesis complete via ${modelName}`);
        return parsed;
      } catch {
        // Fallback: strip markdown blocks if present
        text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
        const parsed = JSON.parse(text) as GeminiResult;
        console.log(`[AI] Intelligence synthesis complete via ${modelName} (after cleanup)`);
        return parsed;
      }
    } catch (err: any) {
      lastError = err;
      console.error(`[AI] ${modelName} Node Failure:`, err.message || err);
      // If it's a model not found error, we definitely want to continue to pro model
      if (err.message?.includes("404") || err.message?.includes("not found")) {
        continue;
      }
      // If it's a safety block, we might as well stop if it's the same content
      if (err.message?.includes("safety") || err.message?.includes("finish_reason")) {
        throw new Error("Content blocked by AI safety filters. Please try a different video.");
      }
      continue;
    }
  }

  // If we reach here, refine the final error message for the frontend
  const finalMsg = lastError?.message || "All intelligence nodes failed to respond.";
  if (finalMsg.includes("404") && finalMsg.includes("gemini")) {
    throw new Error("Target Gemini model version is currently unavailable in your region or API version. Ensure your API key has access to gemini-1.5-flash.");
  }
  
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Guest mode is allowed - do not block!
    const supabase = await createClient();

    const body = await req.json();
    const { url, targetLanguage = "English", category = "Lectures & Tutorials" } = body;

    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json({ error: "Please enter a valid YouTube URL." }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    const thumbnailUrl = videoId ? getThumbnailUrl(videoId) : null;

    let transcriptText = "";
    try {
      if (videoId) {
        console.log(`[Transcript] Fetching for videoId: ${videoId}`);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        transcriptText = transcript.map(t => t.text).join(' ');
      }
    } catch (transcriptErr) {
      console.error("Transcript fetch error:", transcriptErr);
      return NextResponse.json(
        { error: "This video has no available captions. Try a different video." },
        { status: 400 }
      );
    }

    if (!transcriptText) {
      return NextResponse.json(
        { error: "This video has no available captions. Try a different video." },
        { status: 400 }
      );
    }

    // ── Step 1: Firecrawl scrape (Only for Title) ───────────────────────────
    let videoTitle = "YouTube Video";
    try {
      const scrapeResult = await scrapeWithFirecrawl(url);
      const metaTitle = scrapeResult.metadata?.ogTitle ?? scrapeResult.metadata?.title;
      if (metaTitle) videoTitle = metaTitle;
      
      if (scrapeResult.success && scrapeResult.markdown) {
        const titleMatch = scrapeResult.markdown.match(/^#\s+(.+)/m);
        if (titleMatch) videoTitle = titleMatch[1].trim();
      }
    } catch (firecrawlErr) {
      console.error("Firecrawl error (title fetch only):", firecrawlErr);
    }

    // ── Step 3: Fetch Duration ───────────────────────────────────────────
    const durationSeconds = await getYoutubeDuration(url);

    // ── Step 4: Gemini analysis ────────────────────────────────────────────
    let geminiResult: GeminiResult;
    try {
      console.log(`[Summarize] Starting analysis for videoId: ${videoId}`);
      geminiResult = await analyzeWithGemini(transcriptText, videoTitle, targetLanguage, category, durationSeconds);
    } catch (aiErr: any) {
      console.error("[Summarize] Gemini Analysis Critical Failure:", aiErr);
      
      const errorMessage = aiErr.message || String(aiErr);
      
      // Specifically handle Quota/Rate Limit/429 errors
      if (
        errorMessage.includes("429") || 
        errorMessage.toLowerCase().includes("quota") || 
        errorMessage.toLowerCase().includes("rate limit")
      ) {
        return NextResponse.json(
          { 
            error: "Gemini API Quota Exceeded. Please try again in 60 seconds. Free tier users are limited to 15 requests per minute.",
            code: "QUOTA_EXCEEDED"
          },
          { status: 429 }
        );
      }

      // Handle safety blocks
      if (errorMessage.toLowerCase().includes("safety") || errorMessage.toLowerCase().includes("finish_reason") || errorMessage.toLowerCase().includes("blocked")) {
        return NextResponse.json(
          { error: "Content was flagged and blocked by AI safety protocols. This usually happens with restricted or sensitive video content." },
          { status: 400 }
        );
      }

      // Handle model not found (the user's reported error)
      if (errorMessage.toLowerCase().includes("not found") || errorMessage.toLowerCase().includes("404")) {
        return NextResponse.json(
          { error: "Target AI model not found. We are automatically shifting to a stable failover. Please retry your request." },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: `Intelligence synthesis failed: ${errorMessage.length > 100 ? errorMessage.substring(0, 100) + "..." : errorMessage}` },
        { status: 500 }
      );
    }

    // ── Step 5: Save to Supabase ───────────────────────────────────────────
    console.log(`[Summarize] Analysis complete. Saving to Supabase for user: ${userId || 'guest'}`);
    const { data: summary, error: dbError } = await supabase
      .from("summaries")
      .insert({
        user_id: userId || null,
        youtube_url: url,
        video_title: videoTitle,
        thumbnail_url: thumbnailUrl,
        tldr: geminiResult.intelligentSummary,
        key_takeaways: geminiResult.timelineSummary.map(item => ({
          timestamp: item.timestamp,
          summary: `${item.title}: ${item.description}`
        })),
        sentiment: "", // We can leave this empty or put a snippet
        sentiment_score: 0,
        action_items: [], // New prompt doesn't ask for action items
        raw_content: transcriptText.slice(0, 5000),
        content_source: "transcript",
      })
      .select("id, video_title, thumbnail_url, tldr, key_takeaways")
      .single();

    if (dbError) {
      console.error("[Summarize] DB Insertion Error Details:", JSON.stringify(dbError, null, 2));
      return NextResponse.json(
        { error: `Database error: ${dbError.message}. Code: ${dbError.code}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      id: summary.id,
      video_title: summary.video_title,
      thumbnail_url: summary.thumbnail_url,
      tldr: summary.tldr,
      key_takeaways: summary.key_takeaways
    });
  } catch (err) {
    console.error("Summarize API error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
