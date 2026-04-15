import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, notes } = await req.json();

    if (!userId || !notes) return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const supabase = await createClient();

    // Map the guest note structure to our DB structure
    const notesToInsert = notes.map((n: any) => ({
      user_id: userId,
      title: n.title,
      content: n.content, // This is Tiptap JSON
      is_favorite: n.favorite || n.is_favorite || false, // ✅ FIX: Map correct fields
      is_pinned: n.pinned || n.is_pinned || false,
      folder_id: n.folder || n.folder_id || "General",
      last_edited_at: n.updatedAt || n.last_edited_at || new Date().toISOString(),
      created_at: n.createdAt || n.created_at || new Date().toISOString(),
      updated_at: n.updatedAt || n.updated_at || new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("notes")
      .insert(notesToInsert);

    if (error) {
      console.error("Migration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: notes.length });
  } catch (err) {
    console.error("Migration API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
