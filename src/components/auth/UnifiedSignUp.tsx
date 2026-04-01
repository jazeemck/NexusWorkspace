"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Chrome, UserPlus, CheckCircle2, Circle, Mail, Key } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function UnifiedSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: "None", color: "bg-muted" });
  const router = useRouter();

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ["Low", "Weak", "Fair", "Strong", "Encrypted"];
    const colors = ["bg-red-500/20", "bg-orange-500/20", "bg-yellow-500/20", "bg-blue-500/20", "bg-emerald-500/20"];
    
    setStrength({ 
      score, 
      label: labels[score], 
      color: colors[score] 
    });
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password too short.");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split("@")[0] }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Signup failed.");
        setLoading(false);
      } else {
        toast.success("Account created.");
        await signIn("credentials", {
          email,
          password,
          callbackUrl: "/",
        });
      }
    } catch (err) {
      toast.error("Technical error.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
        <p className="text-sm text-muted-foreground">Join the Nexus intelligence network.</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              type="email" 
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-2xl pl-12 pr-5 py-3.5 text-sm focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground ml-1">Password</label>
          <div className="relative">
            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-muted/40 border border-border rounded-2xl pl-12 pr-12 py-3.5 text-sm focus:border-foreground outline-none transition-all placeholder:text-muted-foreground/50"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-all"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between px-1 mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-6 h-1 rounded-full transition-all duration-500",
                    i <= strength.score ? strength.color : "bg-muted/50"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full btn-primary h-14 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/50"></div></div>
        <div className="relative flex justify-center text-xs text-muted-foreground bg-card px-4">OR</div>
      </div>

      <button 
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full bg-transparent border border-border py-4 rounded-xl font-medium text-sm hover:bg-muted/50 transition-all flex items-center justify-center gap-3 group shadow-sm"
      >
        <div className="w-5 h-5 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-all">
          <Chrome className="w-3.5 h-3.5 text-red-500" />
        </div>
        Continue with Google
      </button>

      <p className="text-center text-sm text-muted-foreground pt-2">
        Already registered? <Link href="/auth/signin" className="text-foreground hover:underline transition-all font-medium">Sign In</Link>
      </p>
    </div>
  );
}
