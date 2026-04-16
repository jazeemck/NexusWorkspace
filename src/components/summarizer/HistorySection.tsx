"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Youtube, Clock, Sparkles, ChevronRight, LayoutGrid, List, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface SummaryHistoryItem {
  id: string;
  youtube_url: string;
  video_title: string;
  thumbnail_url: string;
  created_at: string;
  tldr?: string;
}

export default function HistorySection() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadHistory = async () => {
    setLoading(true);
    if (session) {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          if (data.summaries) {
            setHistory(data.summaries);
          }
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      }
    } else {
      const guestDataRaw = localStorage.getItem("guest_data");
      if (guestDataRaw) {
        try {
          const guestData = JSON.parse(guestDataRaw);
          setHistory(guestData.summaries || []);
        } catch (e) {}
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [session]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to remove this intelligence report from your archive?")) return;

    const toastId = toast.loading("Purging records...");

    try {
      if (session) {
        const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Server failed to delete.");
      } else {
        // Guest mode deletion
        const guestDataRaw = localStorage.getItem("guest_data");
        if (guestDataRaw) {
          const guestData = JSON.parse(guestDataRaw);
          guestData.summaries = guestData.summaries.filter((s: any) => s.id !== id);
          localStorage.setItem("guest_data", JSON.stringify(guestData));
        }
      }

      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Intelligence report purged.", { id: toastId });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to purge records.", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-32 flex flex-col items-center justify-center space-y-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-foreground/10 rounded-full" />
          <div className="absolute inset-0 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Intelligence Archives...</p>
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <section className="w-full max-w-5xl mx-auto pt-24 pb-48 space-y-16 animate-fade-in relative z-10">
      {/* Visual Separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-border to-transparent" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <div className="text-center md:text-left space-y-3">
          <div className="flex items-center justify-center md:justify-start gap-4">
             <span className="w-8 h-[1px] bg-foreground/20 hidden md:block" />
             <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.6em] flex items-center gap-3">
                <Clock className="w-3.5 h-3.5" />
                Research Archive
             </h2>
          </div>
          <h3 className="text-4xl md:text-5xl font-black header-contrast leading-tight">
             Previous <br className="md:hidden" /> <span>Syntheses.</span>
          </h3>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 backdrop-blur-xl border border-border/50 p-2 rounded-2xl">
           <button 
             onClick={() => setViewMode("grid")}
             className={`p-3 rounded-xl transition-all ${viewMode === "grid" ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
           >
             <LayoutGrid className="w-4 h-4" />
           </button>
           <button 
             onClick={() => setViewMode("list")}
             className={`p-3 rounded-xl transition-all ${viewMode === "list" ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:text-foreground"}`}
           >
             <List className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
        <AnimatePresence mode="popLayout">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
              className="group"
            >
              <Link
                href={`/result/${item.id}${!session ? "?guest=true" : ""}`}
                className={`block relative h-full bg-card/10 backdrop-blur-3xl border border-border/50 rounded-[3rem] overflow-hidden transition-all duration-700 hover:border-foreground/30 hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.4)] group-hover:-translate-y-2 ${viewMode === "list" ? "flex flex-col md:flex-row items-stretch" : ""}`}
              >
                {/* Image Container */}
                <div className={`${viewMode === "grid" ? "aspect-video" : "w-full md:w-64"} relative overflow-hidden`}>
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.video_title}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                      <Youtube className="w-12 h-12 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40" />
                  
                  {/* Status Indicator */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-foreground/40 animate-pulse" />
                     <span className="text-[8px] font-black uppercase text-foreground/80 tracking-widest bg-background/60 backdrop-blur-md px-3 py-1 rounded-full border border-border/20">
                        {item.id.slice(0, 8)}
                     </span>
                  </div>
                </div>

                {/* Details Container */}
                <div className={`p-8 md:p-10 space-y-6 flex flex-col justify-between ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{formatDate(item.created_at)}</span>
                       <span className="w-1 h-1 rounded-full bg-border" />
                       <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-foreground/40" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">Synthesized</span>
                       </div>
                    </div>
                    
                    <h4 className="text-xl font-black uppercase tracking-tighter leading-tight line-clamp-2 transition-colors duration-500 group-hover:text-foreground">
                       {item.video_title || "Intelligence Data Stream"}
                    </h4>

                    {item.tldr && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed font-bold uppercase tracking-wider opacity-60 line-clamp-3">
                        {item.tldr}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-border/10">
                     <span className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-500">
                        Access Report <ChevronRight className="w-4 h-4" />
                     </span>
                     <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-2 rounded-full hover:bg-red-500/10 text-muted-foreground/40 hover:text-red-500 transition-all duration-300 group/delete hover:scale-110 active:scale-95"
                          title="Purge Intel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Youtube className="w-5 h-5 text-muted-foreground/20 group-hover:text-foreground/40 transition-colors" />
                     </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] bg-foreground/[0.02] rounded-full blur-[160px] pointer-events-none -z-10" />
    </section>
  );
}
