"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
export interface TimelineItem {
    id: number;
    title: string;
    description: string;
    status: "completed" | "in-progress" | "pending";
    icon: React.ElementType;
}

interface RadialOrbitalTimelineProps {
    timelineData: TimelineItem[];
    autoRotate?: boolean;
}

/* ─── Component ──────────────────────────────────────────── */
export default function RadialOrbitalTimeline({
    timelineData,
    autoRotate = true,
}: RadialOrbitalTimelineProps) {
    const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
    const [rotationAngle, setRotationAngle] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<number>(0);
    const prevTimeRef = useRef<number>(0);
    const angleRef = useRef(0);

    /* ─── Responsive detection ─────────────────────────── */
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    /* ─── Subtle rAF-based rotation ─────────────────────── */
    useEffect(() => {
        if (!autoRotate || isMobile || activeNodeId !== null) return;
        const tick = (timestamp: number) => {
            const delta = timestamp - prevTimeRef.current;
            prevTimeRef.current = timestamp;
            if (delta < 100) {
                // Very slow movement: ~0.05° per 16ms → ~3°/s
                angleRef.current = (angleRef.current + (delta / 16) * 0.05) % 360;
                setRotationAngle(angleRef.current);
            }
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, [autoRotate, isMobile, activeNodeId]);

    const toggleItem = useCallback((id: number) => {
        setActiveNodeId(prev => (prev === id ? null : id));
    }, []);

    /* ─── Node positions (Memoized) ─────────────────────── */
    const nodePositions = useMemo(() => {
        const total = timelineData.length;
        const radius = isMobile ? 0 : 160; // Smaller radius for professional look
        return timelineData.map((_, index) => {
            const angle = ((index / total) * 360 + rotationAngle) % 360;
            const rad = (angle * Math.PI) / 180;
            return {
                x: radius * Math.cos(rad),
                y: radius * Math.sin(rad),
                opacity: Math.max(0.6, Math.min(1, 0.6 + 0.4 * ((1 + Math.sin(rad)) / 2))),
            };
        });
    }, [rotationAngle, timelineData, isMobile]);

    /* ─── MOBILE FALLBACK ───────────────────────────────── */
    if (isMobile) {
        return (
            <div className="w-full space-y-3 px-4 py-8">
                {timelineData.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNodeId === item.id;
                    return (
                        <div key={item.id} className="card-minimal overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between p-4 text-left"
                                onClick={() => toggleItem(item.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-black shadow-sm">
                                        <Icon size={14} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">{item.title}</h4>
                                        <p className="text-xs text-slate-500 uppercase tracking-tight">{item.status}</p>
                                    </div>
                                </div>
                                <ArrowRight className={cn("w-4 h-4 transition-transform", isActive && "rotate-90")} />
                            </button>
                            {isActive && (
                                <div className="px-4 pb-4 animate-fade-in">
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    /* ─── DESKTOP ORBITAL ────────────────────────────────── */
    return (
        <div
            className="relative w-full h-[600px] flex items-center justify-center bg-grid-subtle"
            ref={containerRef}
            onClick={() => setActiveNodeId(null)}
        >
            {/* Central Center Reference (SaaS Logo or Placeholder) */}
            <div className="absolute z-10 w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-xl">
                <div className="w-4 h-4 rounded-full border-2 border-white" />
            </div>

            {/* Subtle Gray Orbit Ring */}
            <div className="absolute w-[320px] h-[320px] rounded-full border border-gray-200/50" />

            {/* Nodes */}
            {timelineData.map((item, index) => {
                const pos = nodePositions[index];
                const isActive = activeNodeId === item.id;
                const isHovered = hoveredId === item.id;
                const Icon = item.icon;

                return (
                    <div
                        key={item.id}
                        className="absolute transition-all duration-500 ease-out"
                        style={{
                            transform: `translate(${pos.x}px, ${pos.y}px)`,
                            opacity: isActive ? 1 : pos.opacity,
                            zIndex: isActive ? 50 : 20,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleItem(item.id);
                        }}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        {/* Node Button */}
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shadow-sm",
                                isActive ? "bg-black text-white border-black scale-110" : "bg-white text-black border-gray-200",
                                isHovered && !isActive && "border-gray-400 scale-105"
                            )}
                        >
                            <Icon size={16} />
                        </div>

                        {/* Label (Visible on hover or if active) */}
                        <div
                            className={cn(
                                "absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-opacity",
                                (isHovered || isActive) ? "opacity-100" : "opacity-0"
                            )}
                        >
                            {item.title}
                        </div>

                        {/* Expansion Card (SaaS Style) */}
                        {isActive && (
                            <div
                                className="absolute top-20 left-1/2 -translate-x-1/2 w-64 card-minimal p-4 z-[100]"
                                style={{ animation: "cardExpand 0.2s ease-out forwards" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className="badge-minimal">{item.status}</Badge>
                                </div>
                                <h3 className="text-sm font-semibold text-black mb-1">{item.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
