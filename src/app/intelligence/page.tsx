import Navbar from "@/components/layout/Navbar";
import { BarChart, Brain, Zap, Target } from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Intelligence — Nexus" };

export default async function IntelligencePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || undefined,
    image: session.user.image || undefined
  } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} />

      <div className="pt-16 min-h-screen">
        <main className="max-w-6xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-[2rem] bg-foreground/5 border border-border flex items-center justify-center">
                <Brain className="w-6 h-6 text-foreground/40" />
              </div>
              <span className="text-xs text-muted-foreground font-black uppercase tracking-[0.4em]">Advanced Insights</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
              Deep <span className="text-muted-foreground/40">Intelligence</span>.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
              Unlock cross-video analytics and trend detection. See the patterns in your learning and content consumption like never before.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: BarChart, title: "Content Trends", desc: "Identify recurring themes and topics across all your summarized videos." },
              { icon: Zap, title: "Sentiment Mapping", desc: "Visualize shifts in tone and perspective across different creators and subjects." },
              { icon: Target, title: "Decision Tracking", desc: "Monitor progress on action items extracted from your library of content." }
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-[2.5rem] p-10 hover:border-foreground/20 hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-foreground/60" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-wider">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Intelligence Dashboard */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20 animate-fade-in delay-200">
            <div className="lg:col-span-2 bg-card border border-border rounded-[3rem] p-10 overflow-hidden relative group">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40">Knowledge Density Map</h3>
                <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">+12% Growth</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg transition-all duration-500 hover:scale-110 cursor-help"
                    style={{ backgroundColor: `rgba(0,0,0, ${(i % 10) / 10 * 0.9 + 0.1})`, opacity: (i % 3) === 0 ? 0.2 : 1 }}
                    title={`Topic Cluster ${i + 1}`}
                  />
                ))}
              </div>
              <div className="mt-10 flex justify-between items-end">
                <div>
                  <div className="text-4xl font-black tracking-tighter mb-1">84.2%</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Focus Retention</div>
                </div>
                <div className="w-32 h-1 bg-foreground/5 rounded-full overflow-hidden">
                  <div className="w-[84%] h-full bg-foreground shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
                </div>
              </div>
            </div>

            <div className="bg-black text-white rounded-[3rem] p-10 flex flex-col justify-between shadow-2xl">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Tone Analysis</h3>
                <div className="text-5xl font-black mb-4 tracking-tighter italic">Optimistic.</div>
                <p className="text-white/40 text-sm font-medium leading-relaxed">
                  Your library reflects a strong bias towards practical innovation and forward-thinking content.
                </p>
              </div>
              <div className="pt-10 border-t border-white/10 mt-10">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest opacity-60">
                  <span>CONFIDENCE</span>
                  <span>98.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="grid md:grid-cols-2 gap-8 mb-20 animate-fade-in delay-300">
            <div className="bg-card border border-border rounded-[3rem] p-10">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-foreground/40 mb-8 px-2">Top Knowledge Sources</h3>
              <div className="space-y-6">
                {['Fireship', 'Veritasium', 'Theo - t3.gg', 'Lex Fridman'].map((channel, i) => (
                  <div key={channel} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-muted-foreground/30">0{i + 1}</span>
                      <span className="text-sm font-black uppercase tracking-widest group-hover:pl-2 transition-all">{channel}</span>
                    </div>
                    <div className="text-xs font-black text-muted-foreground/40">{((i + 1) * 7) % 40 + 10} Insights</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-foreground text-background rounded-[3rem] p-10 flex flex-col justify-center text-center items-center shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <BarChart className="w-12 h-12 mb-6 opacity-20" />
              <h3 className="text-2xl font-black mb-4 uppercase tracking-[0.2em] italic">Full Index Report</h3>
              <p className="text-background/40 text-sm font-medium max-w-xs mb-8">
                Generate a comprehensive PDF deep-dive of your cross-video topics and learned directives.
              </p>
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-2xl">
                Download Intelligence .PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}