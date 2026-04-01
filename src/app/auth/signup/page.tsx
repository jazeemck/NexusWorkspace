"use client";

import Link from "next/link";
import UnifiedSignUp from "@/components/auth/UnifiedSignUp";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 selection:bg-foreground selection:text-background transition-colors duration-500">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-subtle pointer-events-none opacity-40" />

      <div className="relative z-10 w-full max-w-md space-y-12">
        <div className="text-center space-y-6">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="bg-foreground w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-background group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <div className="w-4 h-4 rounded-full border-[3px] border-background" />
            </div>
            <div className="text-left">
              <span className="block font-black text-xs uppercase tracking-[0.25em]">Nexus Workspace</span>
              <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Unified Intelligence</span>
            </div>
          </Link>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase font-clean">Initialize Access</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Prepare your global repository for protocol entry</p>
          </div>
        </div>

        <UnifiedSignUp />

        <p className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
          By proceeding, you agree to the Nexus Workspace <span className="text-foreground border-b border-border hover:border-foreground transition-colors cursor-pointer">Protocol Agreement</span>.
        </p>
      </div>
    </div>
  );
}
