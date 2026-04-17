"use client";
import React from 'react';
import { Target } from 'lucide-react';
import MetricTooltip from './MetricTooltip';

interface BlindSpotAlertProps {
  topic?: string;
  missingTopic?: string;
  description?: string;
}

export default function BlindSpotAlert({ 
  topic = "AI Applications", 
  missingTopic = "AI Ethics or Policy", 
  description = "Understanding the systemic and ethical guardrails of artificial intelligence is a critical counterbalance for your current research subject. Focus on integrating governance frameworks into your next synthesis."
}: BlindSpotAlertProps) {
  return (
    <div className="w-full bg-background border border-border rounded-[3rem] p-12 mb-20 group relative overflow-hidden transition-all duration-700 hover:shadow-[0_48px_96px_-32px_rgba(0,0,0,0.1)]">
      {/* Decorative Background Accent */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
        <Target className="w-48 h-48" />
      </div>

      <div className="relative z-10">
        <div className="max-w-4xl space-y-8">
          <div className="flex items-center gap-4">
             <div className="flex items-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground border-l-2 border-foreground pl-4">
                   Blind Spot Detected
                </h3>
                <MetricTooltip content="Nexus identifies critical topical gaps in your research library based on your current focus areas." />
             </div>
             <span className="bg-foreground text-background text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Structural Analysis
             </span>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
              Your library is strong in <span className="opacity-40">{topic}</span> but contains zero content on <span className="underline underline-offset-8 font-black">{missingTopic}</span>.
            </h4>
            <p className="text-muted-foreground text-xl font-medium leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
