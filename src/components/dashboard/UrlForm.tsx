"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { isValidYouTubeUrl } from "@/lib/utils";
import { Loader2, Youtube, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "next-auth/react";

export default function UrlForm() {
  const { data: session } = useSession();
  const [url, setUrl] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentHistory, setRecentHistory] = useState<string[]>([]);
  const router = useRouter();

  const languages = [
    "English", "Spanish", "French", "German", "Chinese",
    "Japanese", "Hindi", "Arabic", "Portuguese", "Russian"
  ];

  // Load history from guest_data or session history
  useState(() => {
    if (typeof window !== 'undefined') {
        const guestDataRaw = localStorage.getItem("guest_data");
        if (guestDataRaw) {
            try {
                const guestData = JSON.parse(guestDataRaw);
                setRecentHistory(guestData.summaries?.map((s: any) => s.youtube_url).slice(0, 5) || []);
            } catch (e) {}
        }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) { toast.error("Please enter a YouTube URL."); return; }
    if (!isValidYouTubeUrl(trimmed)) { toast.error("That doesn't look like a valid YouTube URL."); return; }

    setLoading(true);
    const toastId = toast.loading(`Summarizing video in ${targetLanguage}…`);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, targetLanguage, category: "General Intelligence" }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed.", { id: toastId });
        return;
      }

      // Handle Guest Mode: Save to localStorage if not signed in
      if (!session) {
        const guestDataRaw = localStorage.getItem("guest_data");
        let guestData: { notes: any[], summaries: any[], createdAt: string } = { 
          notes: [], 
          summaries: [], 
          createdAt: new Date().toISOString() 
        };
        
        if (guestDataRaw) {
          try { guestData = JSON.parse(guestDataRaw); } catch (e) {}
        }
        
        // Add current summary to guest data
        const newSummary = {
          id: data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7)),
          youtube_url: trimmed,
          video_title: data.video_title || "YouTube Intelligence Report",
          thumbnail_url: data.thumbnail_url || "",
          tldr: data.intelligentSummary || data.tldr || "", // Map from API response
          key_takeaways: (data.timelineSummary || []).map((item: any) => ({
             timestamp: item.timestamp,
             summary: `${item.title}: ${item.description}`
          })),
          createdAt: new Date().toISOString()
        };
        
        guestData.summaries = [newSummary, ...(guestData.summaries || [])];
        localStorage.setItem("guest_data", JSON.stringify(guestData));
        
        toast.success("Summary saved locally (Guest Mode)", { id: toastId });
        router.push(`/result/${newSummary.id}?guest=true`);
      } else {
        toast.success("Intelligence analysis complete!", { id: toastId });
        router.push(`/result/${data.id}`);
      }
      
      router.refresh();
    } catch (err: unknown) {
      console.error("UI Submission Error:", err);
      toast.error("Failed to start analysis.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-16">
      <form onSubmit={handleSubmit} className="w-full space-y-8 animate-fade-in">
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10 transition-transform group-focus-within:scale-110">
            {loading ? (
              <Loader2 className="w-6 h-6 text-foreground animate-spin" />
            ) : (
              <Youtube className="w-6 h-6 text-muted-foreground group-focus-within:text-foreground transition-all duration-500" />
            )}
          </div>
          <input
            type="url"
            id="youtube-url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => session && setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="PASTE INTELLIGENCE SOURCE URL..."
            disabled={loading}
            autoComplete="off"
            suppressHydrationWarning
            className="w-full bg-background border-2 border-border rounded-[2.5rem] py-8 pl-18 pr-56 text-foreground placeholder-muted-foreground/30 text-lg font-bold shadow-[0_32px_128px_-32px_rgba(0,0,0,0.1)] transition-all focus:border-foreground focus:ring-0 disabled:opacity-60 outline-none hover:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)] hover:border-foreground/10 font-sans tracking-wide uppercase"
          />

          {/* History Popover - Only for signed-in users */}
          {session && showHistory && recentHistory.length > 0 && (
            <div className="absolute bottom-full left-10 mb-6 w-full max-w-md bg-card border border-border rounded-[2rem] p-4 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.5)] backdrop-blur-3xl animate-in slide-in-from-bottom-5 duration-500 z-50">
              <div className="flex flex-col gap-2">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground px-4 py-2 border-b border-border/50 mb-2">Previous Intelligence Gathering</p>
                {recentHistory.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setUrl(h)}
                    className="text-left px-4 py-3 rounded-2xl text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all truncate font-black uppercase tracking-widest"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="absolute inset-y-3 right-3 flex items-center gap-3">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              disabled={loading}
              suppressHydrationWarning
              className="h-full bg-muted/50 border border-border rounded-3xl px-6 text-[10px] font-black text-foreground uppercase tracking-widest outline-none focus:border-foreground transition-all cursor-pointer hover:bg-foreground hover:text-background"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="h-full px-10 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95"
            >
              Synthesize
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
            <p className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-border bg-muted/30 text-[9px] text-muted-foreground font-black uppercase tracking-[0.4em] shadow-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-foreground/40" />
              Nexus Intelligence Engine Version 3.4.2 Active
            </p>
        </div>
      </form>

      {/* Premium Informational Box */}
      <div className="max-w-xl mx-auto flex flex-col items-center text-center animate-fade-in py-16 border border-border bg-card/10 backdrop-blur-3xl rounded-[4rem] px-12 shadow-2xl space-y-8 group hover:-translate-y-2 transition-transform duration-700">
        <div className="w-20 h-20 rounded-[2rem] bg-foreground flex items-center justify-center text-background shadow-[0_20px_50px_rgba(0,0,0,0.2)] group-hover:rotate-12 transition-transform">
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="space-y-4">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em]">Protocol Instructions</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-bold uppercase tracking-widest opacity-60">
              Input a valid data stream URL. Our decentralized AI collective will generate a comprehensive global report in seconds.
            </p>
        </div>
      </div>
    </div>
  );
}
