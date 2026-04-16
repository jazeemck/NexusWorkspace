import React from 'react';

interface NexusSynthesisProps {
  insight: string;
}

export default function NexusSynthesis({ insight }: NexusSynthesisProps) {
  return (
    <div className="w-full full-width bg-muted/50 border-y border-border/50 py-8 mb-20 animate-fade-in delay-150">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground border-l-2 border-foreground pl-4">
              Nexus Synthesis
            </span>
          </div>
          <p className="text-lg font-medium text-foreground leading-relaxed italic opacity-85">
            {insight}
          </p>
        </div>
      </div>
    </div>
  );
}
