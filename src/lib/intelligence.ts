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
  const noteSignals = notes.map(n => `Note: ${n.title}\nContent: ${n.body?.slice(0, 300)}`).join('\n\n');
  const summarySignals = summaries.map(s => `Video: ${s.video_title}\nSummary: ${s.tldr?.slice(0, 300)}`).join('\n\n');

  const prompt = `
    Analyze the following research signals from a user's library and generate a DEEP INTELLIGENCE report.
    
    RESEARCH SIGNALS:
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
      "primaryTone": "string (Single word like 'Optimistic')",
      "toneDescription": "string (Short description of why this tone was detected)",
      "confidence": number (Percentage 0-100)
    }

    Return ONLY the raw JSON.
  `;

  try {
    const { text } = await callAI({
      parts: [{ text: prompt }],
      responseMimeType: "application/json"
    });

    const report = JSON.parse(text);
    return report;
  } catch (error) {
    console.error("Failed to generate intelligence report:", error);
    return null;
  }
}
