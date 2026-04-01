"use client";

import { Brain, FileText, Sparkles, BarChart3, Download, User } from "lucide-react";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const minimalTimelineData: TimelineItem[] = [
    {
        id: 1,
        title: "AI Generator",
        description: "Create professional summaries and notes instantly with Gemini AI.",
        status: "completed",
        icon: Brain,
    },
    {
        id: 2,
        title: "Templates",
        description: "Export results into clean, professional document templates.",
        status: "completed",
        icon: FileText,
    },
    {
        id: 3,
        title: "Smart Suggestions",
        description: "Context-aware AI improvements for your summarized content.",
        status: "in-progress",
        icon: Sparkles,
    },
    {
        id: 4,
        title: "Score Analyzer",
        description: "Evaluate transcription quality and sentiment scores.",
        status: "in-progress",
        icon: BarChart3,
    },
    {
        id: 5,
        title: "Export Tools",
        description: "Pixel-perfect PDF and text exports for all devices.",
        status: "completed",
        icon: Download,
    },
    {
        id: 6,
        title: "User Profile",
        description: "Manage your history and saved intelligence records.",
        status: "pending",
        icon: User,
    },
];

export default function MinimalOrbitalDemoPage() {
    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-[#0f0f0f] flex flex-col font-sans transition-colors duration-300">
            {/* SaaS Header */}
            <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black dark:bg-white rounded flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full border border-white dark:border-black" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-black dark:text-white">Nexus</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle className="scale-90" />
                </div>
            </header>

            {/* Centered Main Section */}
            <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6">
                <div className="text-center mb-12 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 block">Feature Selector</span>
                    <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight mb-3">
                        Minimal Feature Explorer.
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto text-sm">
                        Focus on what matters. A professional view of your application&apos;s core capabilities.
                    </p>
                </div>

                <div className="w-full card-minimal p-2 bg-white dark:bg-[#181818] overflow-hidden relative">
                    <RadialOrbitalTimeline timelineData={minimalTimelineData} />

                    {/* Centered Footer Hint */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 flex items-center gap-2">
                        <span>Click a node to explore</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>ESC to reset</span>
                    </div>
                </div>

                {/* Extra Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full pb-20">
                    {[
                        { title: "Centered Focus", desc: "Balanced layout with clear hierarchy." },
                        { title: "Pure Aesthetics", desc: "Black and white palette for SaaS." },
                        { title: "Adaptive Mode", desc: "Perfectly optimized for light and dark." }
                    ].map(info => (
                        <div key={info.title} className="p-4 border-l border-gray-200 dark:border-white/10">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1">{info.title}</h5>
                            <p className="text-xs text-slate-500">{info.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
