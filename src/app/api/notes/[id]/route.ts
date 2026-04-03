import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, folder, favorite, pinned } = await req.json();
  const supabase = await createClient();
  const { id } = await params;

  // Prepare safe data for update
  const updateData: any = {
    title,
    content,
    is_favorite: favorite || false,
    is_pinned: pinned || false,
    last_edited_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If folder name is "General", it often conflicts with UUID types
  if (folder && folder !== "General") {
    updateData.folder_id = folder;
  } else if (folder === "General") {
      // In text-based DBs, we explicitly set it. In UUID-based DBs, we rely on the default.
      updateData.folder_id = "General";
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select()
    .single();

  if (error) {
    console.error("Notes Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
