"use client";
import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  content: string;
}

export default function MetricTooltip({ content }: MetricTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block ml-2 group">
      <div 
        role="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-foreground transition-colors" />
      </div>
      {isVisible && (
        <div className="absolute z-[100] top-full right-0 mt-2 w-64 p-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 border border-white/10">
          <div className="relative">
            {content}
            <div className="absolute -top-4 right-1 w-2 h-2 bg-black border-l border-t border-white/10 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
