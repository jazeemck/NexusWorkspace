import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidYouTubeUrl, extractVideoId, getThumbnailUrl } from "@/lib/utils";
import { YoutubeTranscript } from 'youtube-transcript';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { GEMINI_BUSY_MESSAGE, GEMINI_QUOTA_MESSAGE } from "@/lib/gemini";
import { callAI } from "@/lib/ai-universal";
import { getYouTubeMetadata } from "@/lib/youtube";

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
  durationSeconds: number | null,
  isMetaDataOnly: boolean = false
): Promise<GeminiResult> {
  const durationText = durationSeconds ? formatDuration(durationSeconds) : "Unknown";

  const assignment = `
  Generate a PRESTIGE-GRADE high-density intelligence report in ${targetLanguage}.
  
  MANDATORY REQUIREMENTS:
  1. "intelligentSummary": A 3-5 paragraph architectural deep-dive (minimum 400 words). If you only have metadata (Title/Description), extrapolate the core value proposition and key themes using your internal knowledge of the subject matter.
  2. "timelineSummary": A chronological mapping of ${isMetaDataOnly ? "exactly 5" : "exactly 10"} segments.
     - IF METADATA ONLY: Distribute the 5 segments across the total duration (${durationText}). For example, if duration is 10:00, space them as 00:00, 02:30, 05:00, 07:30, 09:00. 
     - DO NOT use "00:00" for all segments. ESTIMATE the pacing based on common video structures.

  SCHEMA:
  {
    "intelligentSummary": "string",
    "timelineSummary": [
      { "timestamp": "string", "title": "string", "description": "string" }
    ]
  }

  Return ONLY raw JSON with zero markdown formatting.`;

  const prompt = `TITLE: ${videoTitle}\nDURATION: ${durationText}\nCATEGORY: ${category}\n\nDATA_SIGNALS (May include Transcript, Metadata, or Crawl results):\n${content}\n\nNOTE: The data above is labeled with [SIGNAL_TYPE]. Focus primarily on the [TRANSCRIPT] if available, otherwise analyze the [FIRE_CRAWL_DATA] and [SHORT_DESCRIPTION] to synthesize the core content.\n\n${assignment}`;

  console.log(`[Summarizer] Calling Universal AI Engine (JSON Mode Active)...`);
  const { text } = await callAI({ 
    parts: [{ text: prompt }],
    responseMimeType: "application/json"
  });

  let sanitized = text.trim();
  
  // 1. Precise JSON boundary detection
  const firstBrace = sanitized.indexOf('{');
  const lastBrace = sanitized.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      sanitized = sanitized.substring(firstBrace, lastBrace + 1);
  }

  // 2. Comprehensive Cleaning Pipeline
  const clean = (str: string) => {
    return str
      .replace(/```json|```/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // remove control characters
      .trim();
  };

  const tryParse = (str: string) => {
    try {
      // Direct parse
      return JSON.parse(str);
    } catch (e) {
      // Try to handle literal newlines that AIs often forget to escape
      try {
        const escapedNewlines = str.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        return JSON.parse(escapedNewlines);
      } catch (e2) {
        return null;
      }
    }
  };

  let result = tryParse(clean(sanitized));

  if (!result) {
    console.warn(`[Summarizer] Initial parse failed, attempting deep structural repair...`);
    
    // Deep structural repair: Escape unescaped quotes inside string values
    // This looks for "key": "value" patterns and escapes middle quotes
    let repaired = clean(sanitized);
    
    // Fix common issues: 
    // - Unescaped quotes inside values
    // - Multiple lines in values
    repaired = repaired.replace(/(": ")([\s\S]*?)(",\n|"\s*[,}\]])/g, (match, p1, p2, p3) => {
      // Escape internal quotes that aren't already escaped
      const escaped = p2.replace(/(?<!\\)"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
      return p1 + escaped + p3;
    });

    result = tryParse(repaired);
  }

  if (result) {
    let normalizedResult = result;
    // Normalize top-level keys
    if (!result.intelligentSummary && (result.summary || result.content)) {
        normalizedResult = {
            intelligentSummary: result.summary || result.content,
            timelineSummary: result.timeline || result.segments || result.timelineSummary || []
        };
    }

    // Basic validation of expected keys
    if (normalizedResult.intelligentSummary && Array.isArray(normalizedResult.timelineSummary)) {
        // Normalize array items
        normalizedResult.timelineSummary = normalizedResult.timelineSummary.map((item: any) => ({
            timestamp: item.timestamp || item.time || item.at || "00:00",
            title: item.title || item.heading || "Segment",
            description: item.description || item.summary || item.details || ""
        }));
        return normalizedResult;
    }
  }

  console.error(`[Summarizer] All JSON repair attempts failed for response: ${text.substring(0, 200)}...`);
  throw new Error(`Intelligence engine returned invalid format. Please try again.`);
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

    let contentSignals: string[] = [];
    let videoTitle = "YouTube Video";
    let videoDescription = "";
    let transcriptText = "";
    let extractionMethod = "transcript";

    // ── Step 1: Parallel Extraction Strategy ─────────────────────────────────────
    console.log(`[Extraction] Launching Multi-Layer Intelligence Fetch for: ${videoId}`);
    
    const [transcriptResult, firecrawlResult, oembedResult] = await Promise.allSettled([
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
      scrapeWithFirecrawl(url),
      getYouTubeMetadata(url)
    ]);

    // Handle Transcript Layer
    if (transcriptResult.status === "fulfilled" && transcriptResult.value) {
      const text = transcriptResult.value;
      if (text.length > 50) {
        contentSignals.push(`[TRANSCRIPT]:\n${text}`);
        console.log(`[Extraction] Transcript Layer: SUCCESS (${text.length} chars)`);
      }
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
        
        contentSignals.push(`[FIRE_CRAWL_DATA]:\n${res.markdown}`);
        console.log(`[Extraction] Firecrawl Layer: SUCCESS (${res.markdown.length} chars)`);
      }
    }

    // Handle oEmbed Layer (Most reliable for title/availability)
    if (oembedResult.status === "fulfilled" && oembedResult.value && !('error' in oembedResult.value)) {
      if (videoTitle === "YouTube Video" || !videoTitle) {
        videoTitle = oembedResult.value.title || videoTitle;
      }
      console.log(`[Extraction] oEmbed Layer: SUCCESS (Title: ${videoTitle})`);
    }

    // ── Step 2: Stealth Manual Scrape (Final Bypass Fallback) ──────────────
    if (!transcriptText || transcriptText.trim().length < 200) {
      try {
        console.log("[Extraction] Both parallel layers provided sparse results. Attempting Stealth Manual Scrape...");
        const metaRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }, cache: 'no-store' });
        const html = await metaRes.text();
        
        // Unavailable Detection (More nuanced)
        const isUnavailable = html.includes("Video unavailable") || html.includes("This video isn't available anymore") || html.includes("Private video");
        
        // If oEmbed gave us a title, it's likely NOT private/deleted, just throttled scrape
        const hasOembedTitle = oembedResult.status === "fulfilled" && oembedResult.value && oembedResult.value.title && !oembedResult.value.error;

        if (isUnavailable && !hasOembedTitle) {
          console.warn(`[Extraction] Video reported as unavailable and oEmbed failed. videoId: ${videoId}`);
          return NextResponse.json({ 
            error: "This video appears to be private, restricted, or deleted.",
            code: "VIDEO_UNAVAILABLE"
          }, { status: 404 });
        }

        if (isUnavailable && hasOembedTitle) {
            console.log(`[Extraction] Scrape blocked (Video unavailable page detected) but oEmbed verified title. Continuing with meta analysis...`);
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
                contentSignals.push(`[SHORT_DESCRIPTION]:\n${desc}`);
                console.log(`[Extraction] Stealth Manual Layer: SUCCESS (${desc.length} chars)`);
            }
        }

        // Meta Tag Fallbacks (og:title, og:description)
        if (videoTitle === "YouTube Video" || !videoTitle) {
            const ogTitle = html.match(/<meta property="og:title" content="([^"]+)">/i);
            if (ogTitle) videoTitle = ogTitle[1].trim();
        }
        
        const ogDesc = html.match(/<meta property="og:description" content="([^"]+)">/i);
        if (ogDesc) {
            const desc = ogDesc[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
            contentSignals.push(`[OG_DESCRIPTION]:\n${desc}`);
            console.log(`[Extraction] Meta Tag Layer: SUCCESS`);
        }

        // Chapters Extract
        const cm = html.match(/"title":\{"simpleText":"(.+?)"\},"timeDescriptionUTF8":"(.+?)"/g);
        if (cm && cm.length > 0) {
            const parsed = cm.map(c => {
                const t = c.match(/"title":\{"simpleText":"(.+?)"\}/);
                const tm = c.match(/"timeDescriptionUTF8":"(.+?)"/);
                return t && tm ? `${tm[1]} - ${t[1]}` : null;
            }).filter(Boolean).join("\n");
            if (parsed) contentSignals.push(`[PROCESSED_CHAPTERS]:\n${parsed}`);
        }
      } catch (e) {
        console.error("[Extraction] Stealth Manual Layer: FAILED", e);
      }
    }

    transcriptText = contentSignals.join("\n\n---\n\n");
    extractionMethod = contentSignals.length > 0 ? "multi_signal_synthesis" : "unknown";

    if (!transcriptText || transcriptText.trim().length < 20) {
      // If we have at least a title, we can try to "analyze" based on title/metadata
      if (videoTitle && videoTitle !== "YouTube Video") {
        transcriptText = `No full transcript available for this video.\nTitle: ${videoTitle}\n${videoDescription ? "Description: " + videoDescription : ""}\n\nPlease provide a brief overview based on this metadata only.`;
        extractionMethod = "metadata_fallback";
        console.log("[Extraction] Falling back to Metadata-only analysis.");
      } else {
        console.warn("[Summarize] CRITICAL EXTRACTION FAILURE: All layers failed.");
        return NextResponse.json(
          { 
            error: "This video is restricted or YouTube has blocked our extraction engine. We couldn't even retrieve basic metadata.",
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
    }

    // ── Step 3: Fetch Duration ───────────────────────────────────────────
    const durationSeconds = await getYoutubeDuration(url);

    // ── Step 4: Gemini analysis ────────────────────────────────────────────
    let geminiResult: GeminiResult;
    try {
      console.log(`[Summarize] Starting ${extractionMethod} for videoId: ${videoId}`);
      geminiResult = await analyzeWithGemini(
        transcriptText, 
        videoTitle, 
        targetLanguage, 
        category, 
        durationSeconds,
        extractionMethod === "metadata_fallback" || !contentSignals.some(s => s.startsWith("[TRANSCRIPT]"))
      );
    } catch (aiErr: any) {
      console.error("[Summarize] Gemini Analysis Critical Failure:", aiErr);

      const errorMessage = aiErr.message || String(aiErr);

      if (errorMessage === GEMINI_QUOTA_MESSAGE || errorMessage.includes("quota")) {
        return NextResponse.json({
          error: "AI quota reached for all providers. Please try again tomorrow.",
          code: "QUOTA_EXHAUSTED"
        }, { status: 429 });
      }

      const isBusy =
        errorMessage === GEMINI_BUSY_MESSAGE ||
        errorMessage.includes("429") ||
        errorMessage.toLowerCase().includes("quota");

      if (isBusy) {
        return NextResponse.json({
          error: "Our AI service is temporarily busy. Please try again in a few minutes.",
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
