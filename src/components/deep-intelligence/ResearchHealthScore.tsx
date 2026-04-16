import React from 'react';
import MetricTooltip from './MetricTooltip';

interface ResearchHealthScoreProps {
  score: number;
  summary: string;
  metrics: string[];
}

export default function ResearchHealthScore({ score, summary, metrics }: ResearchHealthScoreProps) {
  return (
    <div className="w-full mb-16 animate-fade-in group">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Research Health Score</h2>
            <MetricTooltip content="A composite metric calculating the overall quality and structural integrity of your research library." />
          </div>
          <div className="text-[120px] font-black tracking-tighter leading-none hover:scale-[1.02] transition-transform duration-700 cursor-default">
            {score}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <p className="text-2xl font-bold tracking-tight text-foreground max-w-3xl leading-tight italic">
          "{summary}"
        </p>
        
        <div className="flex flex-wrap gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric} 
              className="px-5 py-2 rounded-full border border-border bg-background text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300 cursor-default"
            >
              {metric}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
