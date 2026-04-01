import JobSearchClient from "./JobSearchClient";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "AI Job Search — Nexus" };

export default async function JobSearchPage() {
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) redirect("/");
  const user = { id: 'mock-user', email: 'user@example.com' } as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />
      <JobSearchClient user={user} />
    </div>
  );
}
