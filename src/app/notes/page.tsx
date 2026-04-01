import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import NotesClient from "@/components/notes/NotesClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cloud Notes — Nexus" };

export default async function NotesPage() {
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect("/");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-16 min-h-screen">
        <NotesClient initialUser={null} />
      </div>
    </div>
  );
}
