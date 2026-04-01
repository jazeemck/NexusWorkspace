import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export default function GlassCard({ className, children, hover, glow, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-[2rem] p-8 shadow-sm transition-all duration-300",
        hover && "hover:-translate-y-2 hover:shadow-2xl hover:border-foreground/20 cursor-pointer",
        glow && "shadow-[0_0_40px_rgba(0,0,0,0.02)] dark:shadow-[0_0_40px_rgba(255,255,255,0.01)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
