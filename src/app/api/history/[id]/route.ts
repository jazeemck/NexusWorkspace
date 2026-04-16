import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Verify ownership before deleting
    const { data: summary, error: fetchError } = await supabase
      .from("summaries")
      .select("user_id")
      .eq("id", id)
      .single();

    if (fetchError || !summary) {
      return NextResponse.json({ error: "Summary not found." }, { status: 404 });
    }

    if (summary.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this summary." }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("summaries")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete summary." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
