"use client";
import { motion } from "framer-motion";

interface SentimentGaugeProps {
  score: number; // -1.0 to 1.0
  label: string; // 'positive' | 'neutral' | 'negative'
}

export default function SentimentGauge({ score, label }: SentimentGaugeProps) {
  // Score: -1 = fully negative, 0 = neutral, 1 = fully positive
  // Map score [-1, 1] → rotation angle [225deg, -45deg] (semicircle from left to right)
  const normalised = (score + 1) / 2; // 0 to 1

  const colors = {
    positive: "var(--foreground)",
    neutral: "var(--muted-foreground)",
    negative: "var(--border)",
  };
  const color = colors[label as keyof typeof colors] ?? colors.neutral;

  const cx = 100, cy = 100, r = 70;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const start = polarToCartesian(180);
  const end = polarToCartesian(0);

  const needleAngle = 180 - normalised * 180; // 180 (left) to 0 (right)

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 200 120" className="w-64 overflow-visible" role="img" aria-label={`Sentiment: ${label}`}>
        {/* Background track */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated fill arc */}
        <motion.path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * r}`}
          initial={{ strokeDashoffset: Math.PI * r }}
          animate={{ strokeDashoffset: Math.PI * r * (1 - normalised) }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: "none" }}
        />
        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={cx + (r - 10) * Math.cos(((needleAngle - 90) * Math.PI) / 180)}
          y2={cy + (r - 10) * Math.sin(((needleAngle - 90) * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        />
        <circle cx={cx} cy={cy} r="4" fill={color} />
        {/* Labels */}
        <text x="28" y="115" fill="var(--muted-foreground)" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest text-[8px]">Critical</text>
        <text x="100" y="24" fill="var(--muted-foreground)" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest text-[8px]">Neutral</text>
        <text x="172" y="115" fill="var(--foreground)" fontSize="8" fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest text-[8px]">Positive</text>
      </svg>
      <div className="text-center">
        <div
          className="inline-flex items-center px-8 py-3 rounded-2xl border-2 transition-all duration-500 shadow-2xl"
          style={{ borderColor: color, background: label === 'positive' ? 'var(--foreground)' : 'transparent' }}
        >
          <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: label === 'positive' ? 'var(--background)' : color }}>
            {label} Intelligence
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-6 font-black tracking-[0.3em] uppercase opacity-50">Signal Score: {(score >= 0 ? "+" : "") + score.toFixed(2)}</p>
      </div>
    </div>
  );
}
