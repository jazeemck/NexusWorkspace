import Navbar from "@/components/layout/Navbar";
import { BarChart, Brain, Zap, Target, FileText } from "lucide-react";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import ResearchHealthScore from "@/components/deep-intelligence/ResearchHealthScore";
import NexusSynthesis from "@/components/deep-intelligence/NexusSynthesis";
import LearningProgressGraph from "@/components/deep-intelligence/LearningProgressGraph";
import ToneAnalysisCard from "@/components/deep-intelligence/ToneAnalysisCard";
import BlindSpotAlert from "@/components/deep-intelligence/BlindSpotAlert";
import TopKnowledgeSources from "@/components/deep-intelligence/TopKnowledgeSources";
import FullIndexReportCard from "@/components/deep-intelligence/FullIndexReportCard";
import MetricTooltip from "@/components/deep-intelligence/MetricTooltip";

export const metadata = { title: "Deep Intelligence — Nexus" };

export default async function IntelligencePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || undefined,
    image: session.user.image || undefined
  } : undefined;

  // Mock data for the page
  const healthScore = {
    score: 78,
    summary: "You are building focused expertise with a slight bias towards optimistic sources.",
    metrics: ["Focus Retention", "Sentiment Balance", "Learning Velocity", "Source Diversity"]
  };

  const synthesis = "This week you researched consistently, your focus is narrowing positively, but your sources skew heavily optimistic — consider adding critical perspectives.";

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-700">
      <Navbar user={user} />

      <div className="pt-24 min-h-screen">
        <main className="max-w-6xl mx-auto px-6 py-20">
          {/* 1 & 2. Hero Header Section */}
          <div className="mb-24 animate-fade-in group">
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
               <div className="flex items-center gap-3 py-2 px-5 bg-foreground/[0.03] border border-border rounded-full hover:bg-foreground/[0.07] transition-colors duration-500">
                  <Brain className="w-4 h-4 text-foreground/40" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60">Advanced Insights</span>
               </div>
               <div className="h-[1px] flex-grow bg-gradient-to-r from-border to-transparent" />
            </div>
            
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8">
              Deep <br /> <span className="text-muted-foreground/20 group-hover:text-foreground/40 transition-colors duration-1000">Intelligence.</span>
            </h1>
          </div>

          {/* 3. Research Health Score (NEW) */}
          <ResearchHealthScore 
            score={healthScore.score} 
            summary={healthScore.summary} 
            metrics={healthScore.metrics} 
          />
        </main>

        {/* 4. Nexus Synthesis Strip (NEW) */}
        <NexusSynthesis insight={synthesis} />

        <main className="max-w-6xl mx-auto px-6">
          {/* 5. Existing Three Feature Cards Row */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: BarChart, title: "Content Trends", desc: "Identify recurring themes and topics across all your summarized videos.", tooltip: "Clusters metadata and transcript signals to discover patterns across multiple content streams." },
              { icon: Zap, title: "Sentiment Mapping", desc: "Visualize shifts in tone and perspective across different creators and subjects.", tooltip: "Maps emotional trajectories and editorial bias over the duration of your research session." },
              { icon: Target, title: "Decision Tracking", desc: "Monitor progress on action items extracted from your library of content.", tooltip: "Aggregates actionable directives and tasks surfaced from intelligence briefings." }
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-[2.5rem] p-10 hover:border-foreground/20 hover:shadow-2xl transition-all duration-500 group relative">
                <div className="absolute top-8 right-10">
                  <MetricTooltip content={feature.tooltip} />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-foreground/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-wider">{feature.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* 6. Learning Velocity Graph + Tone Analysis */}
          <div className="grid lg:grid-cols-3 gap-8 mb-24 animate-fade-in delay-200">
            <div className="lg:col-span-2">
              <LearningProgressGraph />
            </div>
            <ToneAnalysisCard />
          </div>

          {/* 7. Blind Spot Alert (NEW) */}
          <BlindSpotAlert />

          {/* 8. Top Knowledge Sources + Full Index Report */}
          <div className="grid md:grid-cols-2 gap-8 mb-32 animate-fade-in delay-300">
            <TopKnowledgeSources />
            <FullIndexReportCard />
          </div>
        </main>
      </div>

      {/* Page-wide decorative element */}
      <div className="fixed top-0 right-0 p-32 opacity-[0.01] pointer-events-none -z-50 rotate-45">
        <Brain className="w-[800px] h-[800px]" />
      </div>
    </div>
  );
}