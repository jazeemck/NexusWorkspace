"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ExportBar from "@/components/result/ExportBar";
import { Sparkles, Clock, Zap, ArrowRight, ExternalLink, Youtube, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function ResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isGuestResult = searchParams.get("guest") === "true";
  
  const { data: session } = useSession();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      // 1. Try fetching from Supabase if we have a session OR if it's not explicitly a guest result
      if (!isGuestResult) {
        try {
          const supabase = createClient();
          const { data, error: dbError } = await supabase
            .from("summaries")
            .select("*")
            .eq("id", id)
            .single();

          if (data) {
            setSummary(data);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("DB Fetch failed", e);
        }
      }

      // 2. Fallback to LocalStorage (Guest Mode)
      const guestDataRaw = localStorage.getItem("guest_data");
      if (guestDataRaw) {
        try {
          const guestData = JSON.parse(guestDataRaw);
          const found = guestData.summaries?.find((s: any) => s.id === id);
          if (found) {
            // Map guest structure to DB structure for consistency
            setSummary({
              ...found,
              key_takeaways: found.key_takeaways || [],
              action_items: found.action_items || [],
              created_at: found.createdAt || new Date().toISOString(),
              sentiment: found.sentiment || ""
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Guest data parse failed", e);
        }
      }

      setError("Summary not found. It might have been deleted or moved.");
      setLoading(false);
    };

    fetchSummary();
  }, [id, isGuestResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-foreground animate-spin" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-8">
          <Sparkles className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">Summary Not Found</h1>
        <p className="text-muted-foreground max-w-sm mb-10">{error}</p>
        <Link href="/dashboard" className="px-10 py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px]">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const timestampSummary: Array<{ timestamp: string; summary: string }> = summary.key_takeaways ?? [];
  const translatedSummary: string = summary.sentiment ?? "";
  const actionItems: string[] = summary.action_items ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 min-h-screen">
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-3xl mx-auto px-6 py-20 space-y-10">

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
              {summary.thumbnail_url && (
                <img
                  src={summary.thumbnail_url}
                  alt=""
                  className="w-48 h-28 object-cover rounded-3xl flex-shrink-0 border border-border shadow-2xl transition-transform hover:scale-105"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Youtube className="w-5 h-5 text-foreground/20" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{formatDate(summary.created_at)}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground leading-[1.1] tracking-tight mb-6">
                  {summary.video_title}
                </h1>
                <Link
                  href={summary.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground transition-all bg-background border border-border px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-foreground hover:text-background hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  Source Video
                </Link>
              </div>
            </div>

            <div className="pt-4">
              <ExportBar 
                summaryId={id} 
                videoTitle={summary.video_title ?? "Summary"} 
                tldr={summary.tldr ?? ""} 
                translatedSummary={translatedSummary} 
                timestampSummary={timestampSummary} 
                actionItems={actionItems}
                category="General Intelligence"
              />
            </div>

            <GlassCard className="relative overflow-hidden p-12 group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-foreground/10 group-hover:bg-foreground transition-colors" />
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h2 className="font-black text-foreground text-[11px] uppercase tracking-[0.3em]">Intelligent Summary</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Powered by Gemini Engine</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg font-medium">{summary.tldr}</p>
            </GlassCard>

            {timestampSummary.length > 0 && (
              <GlassCard className="p-12">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                    <Clock className="w-6 h-6 text-foreground" />
                  </div>
                  <h2 className="font-black text-foreground text-[11px] uppercase tracking-[0.3em]">Chronological Timeline</h2>
                </div>
                <div className="space-y-10">
                  {timestampSummary.map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-background bg-foreground border-2 border-foreground rounded-xl px-4 py-2 font-mono min-w-[75px] text-center shadow-lg">
                          {item.timestamp}
                        </span>
                        <div className="w-px h-full bg-border mt-4 group-last:hidden" />
                      </div>
                      <div className="pb-8 group-last:pb-0">
                        <p className="text-lg text-muted-foreground leading-relaxed -mt-1 font-medium group-hover:text-foreground transition-colors">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {actionItems.length > 0 && (
              <GlassCard className="p-12">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-foreground" />
                  </div>
                  <h2 className="font-black text-foreground text-[11px] uppercase tracking-[0.3em]">Action Items</h2>
                </div>
                <div className="grid gap-4">
                  {actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-6 p-8 rounded-[2rem] bg-muted/40 border border-border hover:border-foreground/20 transition-all group">
                      <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-foreground group-hover:text-background">
                        <span className="text-xs font-black">{i + 1}</span>
                      </div>
                      <p className="text-lg text-muted-foreground leading-relaxed font-bold group-hover:text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            <div className="pb-20 pt-10 flex justify-center">
              <Link href="/dashboard" className="px-10 py-5 rounded-2xl bg-background text-muted-foreground border border-border font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-foreground hover:text-background hover:border-foreground">
                ← Back to Intelligence
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div >
  );
}
