"use client";

import { BookOpen, CloudUpload, Briefcase, Zap, Download } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

const timelineData = [
    {
        id: 1,
        title: "App Notes",
        date: "Available Now",
        description:
            "AI-powered smart notes that auto-organize, tag, and summarize your YouTube content. Create searchable knowledge bases from any video.",
        category: "Productivity",
        icon: BookOpen,
        relatedIds: [2, 3],
        status: "completed" as const,
        energy: 95,
    },
    {
        id: 2,
        title: "Saver Cloud",
        date: "Available Now",
        description:
            "Save, organize, and sync all your video intelligence reports across devices. Never lose an insight again with unlimited cloud storage.",
        category: "Storage",
        icon: CloudUpload,
        relatedIds: [1, 5],
        status: "completed" as const,
        energy: 88,
    },
    {
        id: 3,
        title: "Job Finder",
        date: "Beta",
        description:
            "Analyze industry YouTube content and get AI-curated job matches based on skills mentioned in videos. Discover careers you never knew about.",
        category: "Career",
        icon: Briefcase,
        relatedIds: [1, 4],
        status: "in-progress" as const,
        energy: 65,
    },
    {
        id: 4,
        title: "AI Summarizer",
        date: "Core Feature",
        description:
            "The core engine. Paste any YouTube URL and receive an instant AI intelligence report — TL;DR, key takeaways, sentiment analysis, and action items.",
        category: "AI",
        icon: Zap,
        relatedIds: [3, 5],
        status: "completed" as const,
        energy: 100,
    },
    {
        id: 5,
        title: "Smart Export",
        date: "Available Now",
        description:
            "Export your summaries as beautifully formatted PDFs, markdown files, or copy directly to clipboard. Share insights effortlessly.",
        category: "Export",
        icon: Download,
        relatedIds: [2, 4],
        status: "completed" as const,
        energy: 80,
    },
];

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black relative">
            {/* Header overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to home
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-semibold">Nexus</span>
                </div>
            </div>

            {/* Instructions */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
            >
                <p className="text-white/40 text-xs tracking-widest uppercase">Click any node to explore · Click background to reset</p>
            </motion.div>

            {/* Title */}
            <motion.div
                className="absolute top-16 left-1/2 -translate-x-1/2 z-40 text-center w-full px-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Platform Features</h1>
                <p className="text-white/50 text-sm">Interactive orbital view of all capabilities</p>
            </motion.div>

            <RadialOrbitalTimeline timelineData={timelineData} />
        </div>
    );
}
