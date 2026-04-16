"use client";
import React, { useEffect, useState } from 'react';
import MetricTooltip from './MetricTooltip';

interface DataPoint {
  day: string;
  value: number;
}

export default function LearningProgressGraph() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    // Generate mock data only on the client to avoid hydration mismatch
    const mockData: DataPoint[] = Array.from({ length: 12 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      value: 20 + Math.floor(Math.random() * 60) + (i * 2) // Upward trend
    }));
    setData(mockData);
  }, []);

  if (data.length === 0) return (
    <div className="bg-card border border-border rounded-[3rem] p-10 h-[400px] animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      Calibrating Chronological Progress...
    </div>
  );

  const maxVal = Math.max(...data.map(d => d.value)) + 10;
  const width = 800;
  const height = 200;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d.value / maxVal) * (height - padding * 2) + padding);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="bg-card border border-border rounded-[3rem] p-10 group overflow-visible relative transition-all duration-700 hover:border-foreground/20 shadow-sm">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Learning Velocity Graph</h3>
          <MetricTooltip content="Tracks the chronological growth of your knowledge index over the last 12 operational cycles." />
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-green-500/20">
            Linear Growth Detected
          </span>
        </div>
      </div>

      <div className="relative h-[250px] w-full mt-8">
        <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-full overflow-visible">
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1={padding}
              y1={height * p}
              x2={width - padding}
              y2={height * p}
              stroke="currentColor"
              className="text-foreground/[0.03]"
              strokeWidth="1"
            />
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="currentColor" className="text-foreground/[0.02]" />

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-foreground transition-all duration-1000"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                className="fill-background stroke-foreground stroke-[2px] transition-all duration-300 hover:r-6 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint === p && (
                <foreignObject x={p.x - 50} y={p.y - 70} width="100" height="60">
                  <div className="bg-black text-white p-2 rounded-xl text-[8px] font-black uppercase tracking-widest text-center shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150 border border-white/10">
                    <div className="opacity-50 mb-1">{p.day}</div>
                    <div>{p.value} Insight Units</div>
                  </div>
                </foreignObject>
              )}
            </g>
          ))}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute bottom-[-10px] left-0 right-0 flex justify-between px-6">
           <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest">Initial State</span>
           <span className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-widest text-right">Current Index</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-12 border-t border-border/10 mt-10">
        <div>
          <div className="text-5xl font-black tracking-tighter mb-2 italic">84.2%</div>
          <div className="flex items-center">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Focus Retention</div>
            <MetricTooltip content="Measures how consistently your research stays within a core subject area." />
          </div>
        </div>
        <div className="w-48 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
          <div className="w-[84.2%] h-full bg-foreground shadow-[0_0_15px_rgba(0,0,0,0.1)]"></div>
        </div>
      </div>
    </div>
  );
}
