import React from 'react';
import MetricTooltip from './MetricTooltip';

interface ToneSplit {
  label: string;
  percentage: number;
}

export default function ToneAnalysisCard() {
  const toneSplits: ToneSplit[] = [
    { label: 'Optimistic', percentage: 67 },
    { label: 'Neutral', percentage: 21 },
    { label: 'Critical', percentage: 12 }
  ];

  return (
    <div className="bg-black text-white rounded-[3rem] p-10 flex flex-col justify-between shadow-3xl group relative transition-all duration-700 hover:shadow-[0_64px_128px_-32px_rgba(0,0,0,0.5)]">
      <div>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tone Analysis</h3>
            <MetricTooltip content="Aggregated emotional bias detected across all transcript signals in your library." />
          </div>
        </div>
        
        <div className="text-6xl font-black mb-8 tracking-tighter italic">Optimistic.</div>
        
        <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs mb-12">
          Your library reflects a strong bias towards practical innovation and forward-thinking content.
        </p>

        {/* Tone Split Bar */}
        <div className="space-y-4 mb-8">
          <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
            <div className="h-full bg-white" style={{ width: '67%' }}></div>
            <div className="h-full bg-white/40" style={{ width: '21%' }}></div>
            <div className="h-full bg-white/10" style={{ width: '12%' }}></div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-white/40">
            {toneSplits.map((split, i) => (
              <span key={split.label} className={i === 0 ? 'text-white' : ''}>
                {split.label} {split.percentage}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-10 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-[10px] font-black tracking-[0.3em] opacity-40 uppercase">Confidence</span>
            <MetricTooltip content="The statistical probability that the detected sentiment accurately represents the content's objective intent." />
          </div>
          <span className="text-xl font-black tracking-tighter">98.4%</span>
        </div>
      </div>
    </div>
  );
}
