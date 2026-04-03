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
    body: JSON.stringify({ 
      url, 
      formats: ["markdown"],
      onlyMainContent: false, // Ensure we get the full description/chapters
      waitFor: 3000 // Give YouTube time to load dynamic metadata
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    // Log the error for production debugging but don't crash
    console.error(`[Extraction] Firecrawl Failure: HTTP ${res.status}: ${err}`);
    return { success: false, error: err };
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

async function analyzeWithGemini(
  content: string,
  videoTitle: string,
  targetLanguage: string,
  category: string,
  durationSeconds: number | null
): Promise<GeminiResult> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  const durationText = durationSeconds ? formatDuration(durationSeconds) : "Unknown";
  const apiKey = process.env.GEMINI_API_KEY;
  let lastError: any;

  const assignment = `
Generate a high-fidelity intelligence report in ${targetLanguage}:
1. "intelligentSummary": A 3-5 paragraph deep-dive into the core thesis and expert insights.
2. "timelineSummary": A chronological mapping (8-12 segments) with timestamps, titles, and descriptions.

SCHEMA:
{
  "intelligentSummary": "string",
  "timelineSummary": [
    { "timestamp": "string", "title": "string", "description": "string" }
  ]
}

Return ONLY raw JSON.`;

  for (const mId of models) {
    try {
      console.log(`[Summarize] Stabilizing Node: ${mId} via v1beta`);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mId}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `TITLE: ${videoTitle}\nDURATION: ${durationText}\nCATEGORY: ${category}\n\nTRANSCRIPT:\n${content}\n\n${assignment}` 
            }] 
          }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
             // Robust JSON extraction in case AI adds markdown brackets
             let sanitized = text.trim();
             if (sanitized.startsWith("```json")) sanitized = sanitized.replace(/^```json\n|```$/g, "");
             else if (sanitized.startsWith("```")) sanitized = sanitized.replace(/^```\n|```$/g, "");
             return JSON.parse(sanitized);
        }
      } else {
        lastError = await res.text();
        console.warn(`[Summarize] Node ${mId} offline: ${lastError.substring(0, 50)}...`);
      }
    } catch (e) {
      lastError = e;
      continue;
    }
  }

  throw lastError || new Error("All Intelligence Nodes failed to generate report.");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const supabase = await createClient();

    // ── Step 0: Health Check ──────────────────────────────────────────────
    if (!process.env.FIRECRAWL_API_KEY || !process.env.GEMINI_API_KEY) {
        console.error("[HealthCheck] Missing critical API Keys in Environment Variables.");
        return NextResponse.json({ 
            error: "Production environment is misconfigured. Ensure FIRECRAWL_API_KEY and GEMINI_API_KEY are set in your Vercel/Production settings.",
            code: "CONFIG_ERROR"
        }, { status: 500 });
    }

    const body = await req.json();
    const { url, targetLanguage = "English", category = "Lectures & Tutorials" } = body;

    if (!url || !isValidYouTubeUrl(url)) {
      return NextResponse.json({ error: "Please enter a valid YouTube URL." }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    const thumbnailUrl = videoId ? getThumbnailUrl(videoId) : null;

    if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL format. Could not extract Video ID." }, { status: 400 });
    }

    let transcriptText = "";
    let videoTitle = "YouTube Video";
    let videoDescription = "";
    let extractionMethod = "transcript";

    // ── Step 1: Parallel Extraction Strategy ─────────────────────────────────────
    console.log(`[Extraction] Launching Multi-Layer Intelligence Fetch for: ${videoId}`);
    
    const [transcriptResult, firecrawlResult] = await Promise.allSettled([
      (async () => {
        let text = "";
        try {
          let t = await YoutubeTranscript.fetchTranscript(videoId);
          if (!t || t.length === 0) {
            console.warn("[Extraction] Initial fetch empty, trying URL fetch...");
            t = await YoutubeTranscript.fetchTranscript(url);
          }
          if (t && t.length > 0) text = t.map(item => item.text).join(' ');
        } catch (e) {}
        return text;
      })(),
      scrapeWithFirecrawl(url)
    ]);

    // Handle Transcript Layer
    if (transcriptResult.status === "fulfilled" && transcriptResult.value) {
      transcriptText = transcriptResult.value;
      console.log(`[Extraction] Transcript Layer: SUCCESS (${transcriptText.length} chars)`);
    }

    // Handle Metadata/Firecrawl Layer
    if (firecrawlResult.status === "fulfilled" && firecrawlResult.value && firecrawlResult.value.success) {
      const res = firecrawlResult.value;
      const metaTitle = res.metadata?.ogTitle ?? res.metadata?.title;
      if (metaTitle) videoTitle = metaTitle;
      
      if (res.markdown) {
        videoDescription = res.markdown;
        const titleMatch = res.markdown.match(/^#\s+(.+)/m);
        if (titleMatch) videoTitle = titleMatch[1].trim();
        
        // Use as primary if transcript is sparse
        if (!transcriptText || transcriptText.length < 200) {
          transcriptText = (transcriptText ? transcriptText + "\n\n" : "") + videoDescription;
          extractionMethod = transcriptText ? "metadata_analysis" : "transcript";
          console.log(`[Extraction] High-Performance Meta Layer: SUCCESS (${videoDescription.length} chars)`);
        }
      }
    }

    // ── Step 2: Stealth Manual Scrape (Final Bypass Fallback) ──────────────
    if (!transcriptText || transcriptText.trim().length < 200) {
      try {
        console.log("[Extraction] Both parallel layers provided sparse results. Attempting Stealth Manual Scrape...");
        const metaRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }, cache: 'no-store' });
        const html = await metaRes.text();
        
        // Unavailable Detection
        if (html.includes("Video unavailable") || html.includes("This video isn't available anymore") || html.includes("Private video")) {
          return NextResponse.json({ error: "Video is private, restricted, or deleted." }, { status: 404 });
        }

        // Title and Description Extract
        if (videoTitle === "YouTube Video" || videoTitle === "") {
            const tm = html.match(/<title>(.+)<\/title>/i);
            if (tm) videoTitle = tm[1].replace(" - YouTube", "").trim();
        }

        const dm = html.match(/"shortDescription":"(.+?)","isCrawlable"/);
        if (dm) {
            let desc = dm[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
            if (desc.length > 50) {
                transcriptText = (transcriptText && transcriptText.length > 50 ? transcriptText + "\n\n[Additional Metadata]:\n" : "[Metadata Description]:\n") + desc;
                extractionMethod = extractionMethod === "transcript" ? "context_synthesis" : "stealth_manual_analysis";
                console.log(`[Extraction] Stealth Manual Layer: SUCCESS (${desc.length} chars)`);
            }
        }

        // Chapters Extract
        const cm = html.match(/"title":\{"simpleText":"(.+?)"\},"timeDescriptionUTF8":"(.+?)"/g);
        if (cm && cm.length > 0) {
            const parsed = cm.map(c => {
                const t = c.match(/"title":\{"simpleText":"(.+?)"\}/);
                const tm = c.match(/"timeDescriptionUTF8":"(.+?)"/);
                return t && tm ? `${tm[1]} - ${t[1]}` : null;
            }).filter(Boolean).join("\n");
            if (parsed) transcriptText = (transcriptText ? transcriptText + "\n\n[PROCESSED CHAPTERS]:\n" : "[PROCESSED CHAPTERS]:\n") + parsed;
        }
      } catch (e) {
        console.error("[Extraction] Stealth Manual Layer: FAILED", e);
      }
    }

    if (!transcriptText || transcriptText.trim().length < 20) {
      console.warn("[Summarize] CRITICAL EXTRACTION FAILURE: All layers failed.");
      return NextResponse.json(
        { 
          error: "Our extraction engine was temporarily throttled by YouTube. Please try another video or retry in 30 seconds as we rotate our access fingerprints.",
          code: "EXTRACTION_BLOCKED",
          diagnostics: {
             hasTranscript: !!transcriptText,
             hasFirecrawl: !!videoDescription,
             videoId,
             method: extractionMethod
          }
        },
        { status: 429 }
      );
    }

    // ── Step 3: Fetch Duration ───────────────────────────────────────────
    const durationSeconds = await getYoutubeDuration(url);

    // ── Step 4: Gemini analysis ────────────────────────────────────────────
    let geminiResult: GeminiResult;
    try {
      console.log(`[Summarize] Starting ${extractionMethod} for videoId: ${videoId}`);
      geminiResult = await analyzeWithGemini(transcriptText, videoTitle, targetLanguage, category, durationSeconds);
    } catch (aiErr: any) {
      console.error("[Summarize] Gemini Analysis Critical Failure:", aiErr);
      
      const errorMessage = aiErr.message || String(aiErr);
      
      if (errorMessage.includes("429") || errorMessage.toLowerCase().includes("quota")) {
        return NextResponse.json({ 
            error: "Gemini API Quota Exceeded. Please try again in 60 seconds.",
            code: "QUOTA_EXCEEDED"
        }, { status: 429 });
      }

      if (errorMessage.toLowerCase().includes("safety") || errorMessage.toLowerCase().includes("blocked")) {
        return NextResponse.json({ error: "Content flagged by AI safety protocols." }, { status: 400 });
      }

      return NextResponse.json({ error: `Intelligence synthesis failed: ${errorMessage.substring(0, 50)}...` }, { status: 500 });
    }

    // ── Step 5: Save to Supabase ───────────────────────────────────────────
    console.log(`[Summarize] Saving to database for user: ${userId || 'guest'}`);
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
        sentiment: "",
        sentiment_score: 0,
        action_items: [],
        raw_content: transcriptText.slice(0, 5000),
        content_source: extractionMethod,
      })
      .select("id, video_title, thumbnail_url, tldr, key_takeaways")
      .single();

    if (dbError) {
      console.error("[Summarize] DB Insertion Error Details:", JSON.stringify(dbError, null, 2));
      return NextResponse.json({ error: `Database failure: ${dbError.message}` }, { status: 500 });
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
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
