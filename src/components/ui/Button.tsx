"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95";

    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent",
      outline: "border-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted bg-transparent rounded-full",
      danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive shadow-sm rounded-full",
    };

    const sizes = {
      sm: "text-[9px] px-6 py-2.5 tracking-[0.2em] rounded-full",
      md: "text-[10px] px-8 py-3.5 tracking-[0.25em] rounded-full",
      lg: "text-[11px] px-12 py-5 tracking-[0.3em] rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        suppressHydrationWarning
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
