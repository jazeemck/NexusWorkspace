import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("summaries")
      .select("id, youtube_url, video_title, thumbnail_url, created_at, tldr")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) return NextResponse.json({ error: "Failed to fetch history." }, { status: 500 });
    return NextResponse.json({ summaries: data });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
