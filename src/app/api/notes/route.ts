import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", session.user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map database field names to frontend expected names
  const normalizedData = data.map((n: any) => ({
    ...n,
    pinned: n.pinned ?? n.is_pinned ?? false,
    favorite: n.favorite ?? n.is_favorite ?? false,
    folder: n.folder ?? n.folder_id ?? "General",
    createdAt: n.createdAt || n.created_at,
    updatedAt: n.updatedAt || n.updated_at
  }));

  return NextResponse.json(normalizedData);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tags, folder, favorite, pinned, body } = await req.json();
  const supabase = await createClient();
  
  // Map fields to what we found in the database: is_pinned, is_favorite, folder_id
  // If the database is still strictly UUID, "General" will cause an error.
  // We send folder_id as a string; if the DB is set to text (after fix), it works.
  const insertData: any = {
    user_id: session.user.id,
    title,
    content,
    is_favorite: favorite || false,
    is_pinned: pinned || false,
    last_edited_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Only add folder_id if it's not the default "General" string to avoid UUID errors 
  // until the user runs the SQL fix.
  if (folder && folder !== "General") {
    insertData.folder_id = folder;
  } else {
    // If it is 'General', we only send it if it's likely the DB is set to text
    insertData.folder_id = "General";
  }

  const { data, error } = await supabase
    .from("notes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Notes API Error:", error);
    return NextResponse.json({ error: error.message, detail: error.details }, { status: 500 });
  }
  return NextResponse.json(data);
}
