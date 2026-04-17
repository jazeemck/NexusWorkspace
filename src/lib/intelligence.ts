import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai-universal";

export interface IntelligenceReport {
  healthScore: {
    score: number;
    summary: string;
    metrics: string[];
  };
  synthesis: string;
  toneSplit: {
    label: string;
    percentage: number;
  }[];
  primaryTone: string;
  toneDescription: string;
  confidence: number;
  blindSpot: {
    topic: string;
    missingTopic: string;
    description: string;
  };
  knowledgeSources: {
    name: string;
    insights: number;
    depth: number;
    trend: "up" | "down" | "steady";
  }[];
}

export async function generateIntelligenceReport(userId: string): Promise<IntelligenceReport | null> {
  const supabase = await createClient();

  // Fetch data
  const [notesRes, summariesRes] = await Promise.all([
    supabase.from("notes").select("title, body, tags").eq("user_id", userId).limit(20),
    supabase.from("summaries").select("video_title, tldr").eq("user_id", userId).limit(20)
  ]);

  const notes = notesRes.data || [];
  const summaries = summariesRes.data || [];

  if (notes.length === 0 && summaries.length === 0) {
    return null;
  }

  // Construct signals for AI
  const noteSignals = notes.map(n => `Note [${n.tags?.join(", ")}]: ${n.title}`).join('\n');
  const summarySignals = summaries.map(s => `Summarized Video: ${s.video_title}`).join('\n');

  const prompt = `
    Analyze user's research signals and generate a DEEP INTELLIGENCE report.
    
    RESEARCH SIGNALS (Notes & Videos):
    ${noteSignals}
    
    ${summarySignals}
    
    MANDATORY JSON SCHEMA:
    {
      "healthScore": {
        "score": number (0-100),
        "summary": "string (1 sentence summarizing their learning direction)",
        "metrics": ["string", "string", "string", "string"] (4 short metrics like "Focus Velocity", etc.)
      },
      "synthesis": "string (2-3 sentences of deep analytical synthesis)",
      "toneSplit": [
        { "label": "Optimistic", "percentage": number },
        { "label": "Neutral", "percentage": number },
        { "label": "Critical", "percentage": number }
      ],
      "primaryTone": "string",
      "toneDescription": "string",
      "confidence": number,
      "blindSpot": {
        "topic": "string (A topic they are strong in)",
        "missingTopic": "string (A related logical next-step topic they are missing)",
        "description": "string (Why this gap matters)"
      },
      "knowledgeSources": [
        { "name": "string", "insights": number, "depth": number (0-10), "trend": "up"|"down"|"steady" }
      ] (List top 5 sources/channels they seem to be learning from)
    }

    Return ONLY raw JSON.
  `;

  try {
    const { text } = await callAI({
      parts: [{ text: prompt }],
      responseMimeType: "application/json"
    });

    // Helper to clean potential markdown wrappers
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const report = JSON.parse(jsonStr);
    return report;
  } catch (error) {
    console.error("Failed to generate intelligence report:", error);
    return null;
  }
}
