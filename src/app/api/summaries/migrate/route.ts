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
      video_title: s.video_title,
      thumbnail_url: s.thumbnail_url,
      tldr: s.tldr,
      key_takeaways: s.key_takeaways,
      raw_content: s.raw_content,
      content_source: s.content_source || "transcript",
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
