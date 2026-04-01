"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, User as UserIcon, Settings, ChevronDown, LayoutDashboard, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { migrateGuestData } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      migrateGuestData(session.user.id);
    }
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    localStorage.removeItem("guest_data"); 
    toast.success("Signed out successfully.");
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-border bg-background/80 backdrop-blur-xl h-16 flex items-center justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center transition-transform group-hover:rotate-6 shadow-md">
            <div className="w-3 h-3 rounded-full border-2 border-background" />
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight">Nexus</span>
        </Link>

        <div className="flex items-center gap-8">
          {/* Main Navigation Links - Only show when logged in */}
          {session && (
            <div className="hidden md:flex items-center gap-8">
              <Link 
                href="/dashboard" 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all hover:text-foreground",
                  pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              <Link 
                href="/summarizer" 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-all hover:text-foreground",
                  pathname === "/summarizer" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Summarizer
              </Link>
            </div>
          )}

          {!session ? (
            <div className="flex items-center gap-6">
              <Link 
                href="/auth/signin"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="btn-primary flex items-center gap-2"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-all group"
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="w-5 h-5 rounded-full border border-border"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center text-[10px] font-black group-hover:rotate-12 transition-transform">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-medium text-foreground">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-300", showDropdown && "rotate-180")} />
              </button>

              {showDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-3 w-60 bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 slide-in-from-top-2 duration-300">
                    <div className="px-4 py-3 border-b border-border/50 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground truncate">{session.user?.name}</p>
                    </div>
                    
                    <Link 
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link 
                      href="/summarizer"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Zap className="w-4 h-4" />
                      Summarizer
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
