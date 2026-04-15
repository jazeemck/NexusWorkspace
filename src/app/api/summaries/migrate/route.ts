import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, summaries } = await req.json();

    if (!userId || !summaries) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const supabase = await createClient();

    // Map guest summaries to DB structure
    const summariesToInsert = summaries.map((s: any) => ({
      user_id: userId,
      youtube_url: s.youtube_url,
      video_title: s.video_title || "Migrated Video",
      thumbnail_url: s.thumbnail_url,
      tldr: s.tldr || s.intelligent_summary, // ✅ FIX: Use 'tldr' instead of 'intelligent_summary'
      key_takeaways: s.key_takeaways || s.timeline_summary || [], // ✅ FIX: Use 'key_takeaways'
      raw_content: s.raw_content || s.raw_transcript || "", // ✅ FIX: Use 'raw_content'
      sentiment: s.sentiment || "",
      sentiment_score: s.sentiment_score || 0,
      action_items: s.action_items || [],
      content_source: "migration",
      created_at: s.createdAt || new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("summaries")
      .insert(summariesToInsert);

    if (error) {
      console.error("Summaries Migration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: summaries.length });
  } catch (err) {
    console.error("Summaries Migration API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
