"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Activity, 
  BarChart3, 
  Briefcase, 
  Pencil, 
  CheckCircle2, 
  ArrowRight,
  Monitor,
  Youtube
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const features = [
  {
    id: "summarizer",
    name: "Summarizer",
    icon: Activity,
    title: "Nexus Summarizer",
    description: "Instantly condense long documents, articles, or reports into clear, structured summaries. Save hours of reading time.",
    bullets: [
      "Paste any URL or upload a PDF",
      "Get key points in seconds",
      "Choose summary length",
      "Export as notes or share"
    ],
    cta: "Try Summarizer",
    route: "/summarizer"
  },
  {
    id: "intelligence",
    name: "Intelligence",
    icon: BarChart3,
    title: "Deep Intelligence",
    description: "Get AI-powered insights and analytics from your data. Understand trends, patterns, and metrics at a glance.",
    bullets: [
      "Real-time data analysis",
      "Custom dashboards",
      "Natural language queries",
      "Predictive insights"
    ],
    cta: "Try Intelligence",
    route: "/intelligence"
  },
  {
    id: "jobs",
    name: "AI Job Search",
    icon: Briefcase,
    title: "Career Catalyst",
    description: "Let AI match you with the best job opportunities based on your skills, experience, and preferences — automatically.",
    bullets: [
      "Auto-apply to matched roles",
      "Resume optimization tips",
      "Salary benchmarking",
      "Interview prep with AI"
    ],
    cta: "Try AI Job Search",
    route: "/dashboard/jobs"
  },
  {
    id: "notes",
    name: "Cloud Notes",
    icon: Pencil,
    title: "Persistent Cloud Notes",
    description: "Capture, organize, and retrieve your notes from anywhere. AI helps you tag, connect, and surface relevant content.",
    bullets: [
      "Auto-tagging and categories",
      "AI-powered search",
      "Link related notes",
      "Sync across all devices"
    ],
    cta: "Try Cloud Notes",
    route: "/notes"
  },
  {
    id: "all",
    name: "All Features",
    icon: Zap,
    title: "Nexus Workspace",
    description: "Explore everything Nexus has to offer. Each feature is designed to work together, creating a seamless AI-powered workflow.",
    bullets: [
      "Unified workspace",
      "All tools connected",
      "Single subscription",
      "Continuous updates"
    ],
    cta: "Explore Nexus",
    route: "/dashboard"
  }
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState(features[0]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-stretch transition-all duration-300 overflow-x-hidden">
      <Navbar />
      {/* 1. Top Header & Tab Bar Area */}
      <div className="pt-32 px-8 flex flex-col gap-12 border-b border-border">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-widest mb-2">Feature Explorer</h1>
           <p className="text-muted-foreground font-medium italic">Discover the core intelligence of the Nexus Workspace</p>
        </div>

        {/* Tab Bar */}
        <div className="flex items-end gap-1 overflow-x-auto no-scrollbar">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature)}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-300 border-b-2 whitespace-nowrap ${
                activeTab.id === feature.id 
                ? "border-foreground text-foreground bg-foreground/5 opacity-100" 
                : "border-transparent text-muted-foreground hover:text-foreground opacity-60 hover:opacity-80"
              }`}
            >
              <feature.icon className={`w-4 h-4 ${activeTab.id === feature.id ? "text-foreground" : ""}`} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{feature.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Panel: Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <h2 className="text-5xl font-black tracking-tighter italic uppercase">{activeTab.title}</h2>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
                  {activeTab.description}
                </p>
              </div>

              <div className="space-y-4">
                {activeTab.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-muted-foreground font-medium hover:text-foreground transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-foreground/20" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              <Link 
                href={activeTab.route}
                className="inline-flex items-center gap-4 bg-foreground text-background px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-transform shadow-xl shadow-foreground/5"
              >
                {activeTab.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Right Panel: Demo Preview Box */}
          <div className="relative group">
            {/* Ambient Glow */}
            <div className={`absolute -inset-4 rounded-[3rem] blur-3xl opacity-5 transition-all duration-1000 group-hover:opacity-10 ${
              activeTab.id === 'summarizer' ? 'bg-green-500' :
              activeTab.id === 'intelligence' ? 'bg-blue-500' :
              activeTab.id === 'jobs' ? 'bg-purple-500' :
              activeTab.id === 'notes' ? 'bg-orange-500' : 'bg-foreground'
            }`} />

            <div className="relative bg-card border border-border rounded-[2rem] overflow-hidden shadow-3xl aspect-[4/3] flex flex-col">
              {/* Fake Browser Bar */}
              <div className="h-10 border-b border-border bg-muted/50 flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="ml-4 h-4 w-32 bg-muted rounded-full opacity-50" />
              </div>

              {/* Demo Content Area */}
              <div className="flex-1 p-8 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full"
                  >
                    {activeTab.id === "summarizer" && (
                      <div className="flex flex-col items-center justify-center h-full gap-8 relative">
                        <div className="w-64 h-32 bg-foreground/[0.03] border border-border/50 rounded-xl flex flex-col gap-3 p-5 relative overflow-hidden">
                          {/* Large YouTube Watermark */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-15">
                             <Youtube className="w-24 h-24 text-red-600" />
                          </div>

                          {/* Scanning Neon Line */}
                          <motion.div 
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute left-0 right-0 h-[2px] bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)] z-20"
                          />
                        </div>
                        
                        <motion.div 
                          animate={{ y: [0, 5, 0], scale: [1, 1.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-green-500"
                        >
                          <ArrowRight className="w-8 h-8 rotate-90" />
                        </motion.div>

                        <motion.div 
                          animate={{ borderColor: ["rgba(34,197,94,0.1)", "rgba(34,197,94,0.6)", "rgba(34,197,94,0.1)"] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="w-64 h-20 border-2 border-green-500/30 bg-green-500/[0.03] rounded-xl flex flex-col gap-3 p-5 shadow-lg shadow-green-500/10"
                        >
                          <motion.div 
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="h-2 w-full bg-green-500/60 rounded-full" 
                          />
                          <motion.div 
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                            className="h-2 w-[70%] bg-green-500/60 rounded-full" 
                          />
                        </motion.div>
                      </div>
                    )}

                    {activeTab.id === "intelligence" && (
                      <div className="flex flex-col justify-center h-full gap-8 px-12">
                        {[
                          { label: "Reach", val: "84%", color: "bg-blue-500" },
                          { label: "Engage", val: "62%", color: "bg-purple-500" },
                          { label: "Convert", val: "45%", color: "bg-green-500" },
                          { label: "Retain", val: "91%", color: "bg-orange-500" }
                        ].map((stat, i) => (
                          <div key={i} className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <span>{stat.label}</span>
                              <span className="text-foreground">{stat.val}</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: stat.val }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={`h-full ${stat.color} shadow-[0_0_10px_rgba(var(--foreground),0.1)]`} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab.id === "jobs" && (
                      <div className="flex flex-col h-full gap-4 px-8 pt-4 overflow-y-hidden">
                        {[
                          { title: "Senior AI Engineer", co: "Anthropic", loc: "San Francisco", match: "98%" },
                          { title: "Product Designer", co: "Linear", loc: "Remote", match: "92%" },
                          { title: "Frontend Lead", co: "Vercel", loc: "London", match: "89%" }
                        ].map((job, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-[10px] font-bold">Logo</div>
                              <div>
                                <div className="text-sm font-black text-foreground">{job.title}</div>
                                <div className="text-[10px] text-muted-foreground font-medium">{job.co} • {job.loc}</div>
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20">
                              {job.match} Match
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {activeTab.id === "notes" && (
                      <div className="grid grid-cols-1 gap-4 h-full p-4 overflow-hidden">
                        {[
                          { tag: "MEETING · Apr 15", title: "Project Nexus Strategy", color: "border-blue-500" },
                          { tag: "RESEARCH · Apr 16", title: "AI Model Comparison", color: "border-green-500" },
                          { tag: "IDEAS · Apr 17", title: "Future Roadmap v2", color: "border-purple-500" }
                        ].map((note, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ x: 5 }}
                            className={`bg-card border-l-4 ${note.color} border-y border-r border-border p-4 rounded-r-xl space-y-2 cursor-pointer transition-colors hover:bg-muted/30`}
                          >
                            <div className="text-[8px] font-black text-muted-foreground tracking-widest uppercase">{note.tag}</div>
                            <div className="text-sm font-black text-foreground">{note.title}</div>
                            <div className="h-1 w-24 bg-border rounded" />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {activeTab.id === "all" && (
                      <div className="grid grid-cols-2 gap-8 h-full items-center p-12">
                        {features.slice(0, 4).map((f, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            className="flex flex-col items-center gap-3"
                          >
                            <div className="w-16 h-16 bg-foreground/[0.03] border border-border rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-foreground/10 transition-colors">
                              <f.icon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{f.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
