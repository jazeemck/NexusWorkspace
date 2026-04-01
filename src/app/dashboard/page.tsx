import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import UrlForm from "@/components/dashboard/UrlForm";
import { Youtube, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  // In a real app, fetch from Supabase here
  const history: any[] = []; 

  return (
    <div className="min-h-screen bg-background relative selection:bg-foreground selection:text-background font-sans transition-all duration-700">
      <Navbar />
      
      <div className="relative pt-48 pb-32 flex flex-col items-center justify-center bg-grid-subtle min-h-screen">
        <main className="max-w-5xl mx-auto px-6 w-full">
          {/* Header Section */}
          <div className="text-center space-y-6 mb-24 animate-fade-in">
            <p className="text-subtle">Nexus Workspace</p>
            <h1 className="text-6xl md:text-8xl header-contrast leading-[1.05]">
              Executive <br /> <span>Dashboard.</span>
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
          <div className="space-y-12 mt-40">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Research Archives</h2>
              <Link href="/archive" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all group">
                Full Collection <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            {history.length > 0 ? (
              <div className="grid gap-6">
                 {history.map((item) => (
                    <Link
                      key={item.id}
                      href={`/result/${item.id}`}
                      className="group flex flex-col md:flex-row items-center gap-6 p-6 card-minimal"
                    >
                      <div className="w-full md:w-40 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-border relative">
                        {item.thumbnail_url ? (
                          <Image src={item.thumbnail_url} alt="" width={160} height={96} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <Youtube className="w-full h-full p-6 text-muted-foreground opacity-20" />
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left min-w-0 space-y-2">
                        <h3 className="font-black text-lg uppercase tracking-tighter truncate group-hover:text-foreground transition-colors">{item.video_title || "Untitled Intelligence"}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{formatDate(item.created_at)}</span>
                          <span className="text-[8px] py-1 px-3 rounded-full bg-foreground/5 text-foreground font-black uppercase tracking-widest border border-border">Source: {item.content_source}</span>
                        </div>
                      </div>
                    </Link>
                 ))}
              </div>
            ) : (
              <div className="p-20 card-minimal flex flex-col items-center justify-center text-center space-y-8">
                <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center text-background shadow-lg">
                  <Youtube className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <p className="text-[12px] font-black uppercase tracking-widest text-foreground">Archive Empty</p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-60">Generate a new summary to populate your research repository.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
