import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import UrlForm from "@/components/dashboard/UrlForm";
import HistorySection from "@/components/summarizer/HistorySection";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-background relative selection:bg-foreground selection:text-background font-sans transition-all duration-700 overflow-x-hidden">
      <Navbar />
      
      <div className="relative pt-48 pb-32 flex flex-col items-center justify-center bg-grid-subtle min-h-screen">
        <main className="max-w-7xl mx-auto px-6 w-full relative z-10">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-24 animate-fade-in">
            <p className="text-subtle">Executive Interface</p>
            <h1 className="text-6xl md:text-8xl header-contrast leading-[1.05]">
              Intelligence <br /> <span>Command.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-80">
              Welcome back, {session?.user?.name?.split(" ")[0] || 'Member'}. Accessing your research archive.
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-4xl mx-auto mb-32 w-full">
            <UrlForm />
          </div>

          {/* History Section */}
          <div className="mt-20">
             <HistorySection />
          </div>
        </main>
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[600px] bg-foreground/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />
      </div>
    </div>
  );
}
