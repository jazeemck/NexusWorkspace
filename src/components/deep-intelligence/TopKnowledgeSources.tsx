"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import MetricTooltip from './MetricTooltip';

interface Source {
  name: string;
  insights: number;
  depth: number;
  trend: 'up' | 'down' | 'steady';
}

const sources: Source[] = [
  { name: 'Fireship', insights: 42, depth: 8.9, trend: 'up' },
  { name: 'Veritasium', insights: 38, depth: 9.2, trend: 'steady' },
  { name: 'Theo - t3.gg', insights: 31, depth: 7.4, trend: 'up' },
  { name: 'Lex Fridman', insights: 28, depth: 8.4, trend: 'down' },
  { name: '3Blue1Brown', insights: 24, depth: 9.8, trend: 'up' },
];

export default function TopKnowledgeSources() {
  const [sortKey, setSortKey] = useState<'volume' | 'depth'>('volume');

  const sortedSources = [...sources].sort((a, b) => 
    sortKey === 'volume' ? b.insights - a.insights : b.depth - a.depth
  );

  return (
    <div className="bg-card border border-border rounded-[3rem] p-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
        <div className="flex items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Top Knowledge Sources</h3>
          <MetricTooltip content="Aggregated analysis of content creators who have contributed the most signal to your library." />
        </div>
        
        {/* Toggle */}
        <div className="flex bg-muted rounded-xl p-1 border border-border/50">
          <button 
            onClick={() => setSortKey('volume')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortKey === 'volume' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            By Volume
          </button>
          <button 
            onClick={() => setSortKey('depth')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortKey === 'depth' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            By Depth
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <AnimatePresence mode="popLayout">
          {sortedSources.map((source, i) => (
            <motion.div 
              key={source.name} 
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-muted-foreground/30 w-4">
                  {i + 1 < 10 ? `0${i + 1}` : i + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black uppercase tracking-widest group-hover:pl-1 transition-all">
                      {source.name}
                    </span>
                    {source.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {source.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-400 opacity-40" />}
                    {source.trend === 'steady' && <Minus className="w-3 h-3 text-muted-foreground/20" />}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                 <div className="text-[10px] font-black tracking-widest text-foreground">
                    {source.insights} Insights
                 </div>
                 <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                    Depth {source.depth}/10
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 pt-8 border-t border-border/10">
        <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em]">
          Ranked by structural signal density
        </p>
      </div>
    </div>
  );
}
