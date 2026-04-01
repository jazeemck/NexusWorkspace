"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chrome, LogIn, Key, Mail, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";

export default function UnifiedSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid credentials.");
      setLoading(false);
    } else {
      toast.success("Welcome back.");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black tracking-tight uppercase font-clean text-foreground">Sign In</h2>
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Access your intelligence archive</p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              type="email" 
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-2xl pl-12 pr-5 py-3.5 text-xs font-bold focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/30"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Password</label>
            <Link href="/auth/forgot-password" title="Recover Password" className="text-[8px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest opacity-60 hover:opacity-100 transition-all">Forgot?</Link>
          </div>
          <div className="relative">
            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-2xl pl-12 pr-12 py-3.5 text-xs font-bold focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/30"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-50 h-14"
        >
          <LogIn className="w-4 h-4" />
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
        <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.4em] text-muted-foreground/40 bg-card px-4">OR</div>
      </div>

      <button 
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full bg-transparent border border-border py-4 rounded-full font-black uppercase tracking-[0.1em] text-[10px] hover:bg-muted/50 transition-all flex items-center justify-center gap-3 group shadow-sm"
      >
        <div className="w-5 h-5 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-all">
          <Chrome className="w-3.5 h-3.5 text-red-500" />
        </div>
        Continue with Google
      </button>

      <p className="text-center text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground pt-2">
        New here? <Link href="/auth/signup" className="text-foreground border-b border-foreground/20 hover:border-foreground transition-all">Create Account</Link>
      </p>
    </div>
  );
}
