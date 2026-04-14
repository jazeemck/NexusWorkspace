import JobSearchClient from "./JobSearchClient";
import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "AI Job Search — Nexus" };

export default async function JobSearchPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = session.user as any;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />
      <JobSearchClient user={user} />
    </div>
  );
}
