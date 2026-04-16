"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { 
  Zap, 
  Play, 
  ArrowRight, 
  LogOut, 
  X,
  Sparkles,
  Youtube
} from "lucide-react";
import Button from "@/components/ui/Button";
import UnifiedSignUp from "@/components/auth/UnifiedSignUp";
import toast from "react-hot-toast";

export default function LandingClient({ session }: { session: Session | null }) {
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ redirect: false });
    toast.success("Disconnected from intelligence network.");
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-stretch transition-all duration-700 selection:bg-foreground selection:text-background font-sans">
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-border h-16 flex items-center justify-center">
        <div className="w-full max-w-6xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shadow-md transition-transform group-hover:rotate-6">
              <div className="w-3 h-3 rounded-full border-2 border-background" />
            </div>
            <span className="font-bold text-foreground text-xl tracking-tight">Nexus</span>
          </Link>
          {session ? (
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-card">
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-5 h-5 rounded-full border border-border" />
                ) : (
                   <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-black">{session.user?.name?.charAt(0)}</div>
                )}
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                  {session.user?.name?.split(" ")[0]}
                </span>
              </div>
              <button onClick={handleSignOut} disabled={loading} className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/auth/signin" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <button 
                onClick={() => setShowSignUpModal(true)}
                className="btn-primary"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-40 pb-32 flex flex-col items-center justify-center">
        <div className="mx-auto max-w-5xl px-6 text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
              Next-Generation Intelligence
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
              The unified workspace for <br /> <span className="text-muted-foreground">elite thinkers.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Nexus instantly distills hours of YouTube deep-dives into structured notes. Organize your research, supercharge your learning, and build your ultimate knowledge graph.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            {session ? (
              <Button onClick={() => router.push('/dashboard')} size="lg" className="rounded-xl px-12 h-16 btn-primary">
                <Zap className="w-5 h-5 fill-current" /> Enter Workspace
              </Button>
            ) : (
              <Button onClick={() => setShowSignUpModal(true)} size="lg" className="rounded-xl px-12 h-16 btn-primary">
                <Zap className="w-5 h-5 fill-current" /> Start For Free
              </Button>
            )}
          </div>

          {/* Product Preview */}
          <div className="relative mx-auto mt-24 max-w-5xl w-full aspect-video rounded-[3rem] border border-border bg-card shadow-[0_32px_128px_-32px_rgba(0,0,0,0.3)] overflow-hidden p-4 flex items-center justify-center transition-all hover:scale-[1.01] duration-700 bg-grid-subtle group cursor-pointer" onClick={() => router.push('/summarizer')}>
            <div className="w-full h-full rounded-[2rem] bg-background/50 backdrop-blur-xl border border-border/50 flex flex-col items-center justify-center gap-6 relative">
              <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center shadow-2xl group-hover:scale-110 active:scale-90 transition-all duration-500">
                <Play className="w-8 h-8 text-background ml-1" />
              </div>
              <p className="text-sm font-medium tracking-wide text-muted-foreground">Launch Nexus Interface</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Everything you need in one place</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Stop jumping between tabs. Nexus brings your summaries, notes, and AI chat into a single seamless environment.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-card border border-border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500/10 transition-colors duration-300">
                 <Youtube className="w-6 h-6 text-muted-foreground group-hover:text-red-500 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(239,68,68,0)] group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Summaries</h3>
              <p className="text-muted-foreground text-sm">Drop any YouTube link and instantly receive a structured, timestamped breakdown of the core concepts.</p>
            </div>
            
            <div className="group bg-card border border-border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/10 transition-colors duration-300">
                 <Sparkles className="w-6 h-6 text-muted-foreground group-hover:text-blue-500 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0)] group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Intelligence</h3>
              <p className="text-muted-foreground text-sm">Chat directly with the AI about your videos or documents to extract nuances and clarify complex topics.</p>
            </div>
            
            <div className="group bg-card border border-border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500/10 transition-colors duration-300">
                 <Zap className="w-6 h-6 text-muted-foreground group-hover:text-amber-500 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(245,158,11,0)] group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cloud Notes</h3>
              <p className="text-muted-foreground text-sm">Save your insights into beautifully formatted cloud notes that sync instantly across all your devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-50"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to upgrade your workflow?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Join thousands of researchers, students, and professionals who trust Nexus Workspace.</p>
          {session ? (
            <Button onClick={() => router.push('/dashboard')} size="lg" className="rounded-xl px-12 h-16 btn-primary group">
               Access Executive Workspace <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          ) : (
            <Button onClick={() => setShowSignUpModal(true)} size="lg" className="rounded-xl px-12 h-16 btn-primary">
               Create Your Free Account
            </Button>
          )}
        </div>
      </section>

      {/* Signup Modal Popup */}
      {showSignUpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-2xl bg-background/50">
          <div className="absolute inset-0" onClick={() => setShowSignUpModal(false)} />
          <div className="relative w-full max-w-sm animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setShowSignUpModal(false)}
              className="absolute -top-12 right-0 p-3 rounded-full bg-card border border-border hover:bg-muted transition-all active:scale-95 shadow-xl"
            >
              <X className="w-5 h-5" />
            </button>
            <UnifiedSignUp />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-20 border-t border-border mt-32 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-black text-lg shadow-lg">Y</div>
             <p className="text-sm font-medium text-muted-foreground">© 2026 Nexus Workspace</p>
          </div>
          <div className="flex gap-10">
            {['Terms', 'Privacy', 'Security', 'Contact'].map(item => (
               <Link key={item} href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all">
                 {item}
               </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
