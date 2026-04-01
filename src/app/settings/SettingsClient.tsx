"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Button from "@/components/ui/Button";
import { Session } from "next-auth";
import {
    Settings as SettingsIcon,
    User as UserIcon,
    Shield,
    Database,
    Cloud,
    LogOut,
    Zap,
    DownloadCloud,
    Trash2
} from "lucide-react";

export default function SettingsClient({ session }: { session: Session | null }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("account");
    const router = useRouter();
    const user = session?.user;

    const handleSignOut = async () => {
        setLoading(true);
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
        toast.success("Signed out successfully.");
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        await signIn("google", { callbackUrl: "/settings" });
    };

    const handleExportData = () => {
        toast.success("Compiling data for export. This will begin downloading shortly.");
        // Simulated export behavior
    };

    const handleClearLocalData = () => {
        if(confirm("Are you sure you want to clear all offline note data?")) {
            localStorage.removeItem("notes");
            toast.success("Local storage cleared.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-14 h-14 rounded-[2rem] bg-foreground text-background flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform">
                        <SettingsIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight mb-2">Nexus Config</h1>
                        <p className="text-muted-foreground font-medium text-lg">Manage cross-platform preferences and profile authentication.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    {/* Navigation Sidebar */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-4 px-2">Navigation</div>
                        <Button 
                            variant={activeTab === "account" ? "primary" : "ghost"} 
                            className="w-full justify-start gap-4 h-14 rounded-2xl"
                            onClick={() => setActiveTab("account")}
                        >
                            <UserIcon className="w-5 h-5" /> Account & Security
                        </Button>
                        <Button 
                            variant={activeTab === "preferences" ? "primary" : "ghost"} 
                            className="w-full justify-start gap-4 h-14 rounded-2xl"
                            onClick={() => setActiveTab("preferences")}
                        >
                            <Zap className="w-5 h-5" /> Preferences
                        </Button>
                        <Button 
                            variant={activeTab === "data" ? "primary" : "ghost"} 
                            className="w-full justify-start gap-4 h-14 rounded-2xl"
                            onClick={() => setActiveTab("data")}
                        >
                            <Database className="w-5 h-5" /> Storage & Data
                        </Button>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8 animate-fade-in">
                        
                        {/* Tab: Account Settings */}
                        {activeTab === "account" && (
                            <>
                                <GlassCard className="p-10 border-border rounded-[3rem] shadow-sm">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-muted rounded-2xl"><Shield className="w-6 h-6 text-foreground" /></div>
                                        <h2 className="text-2xl font-black tracking-tight">Authentication Status</h2>
                                    </div>
                                    
                                    {user ? (
                                        <div className="space-y-8 border border-border rounded-[2rem] p-8 bg-background">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    {user.image ? (
                                                        <img src={user.image} alt="Profile" className="w-20 h-20 rounded-full border border-border shadow-sm" />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border border-border">
                                                            <UserIcon className="w-8 h-8 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="text-xl font-bold">{user.name || 'Authorized User'}</h3>
                                                        <p className="text-muted-foreground">{user.email}</p>
                                                        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                                            Active Session
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" onClick={handleSignOut} disabled={loading} className="gap-3 rounded-xl border-border hover:bg-destructive hover:text-white hover:border-destructive transition-all">
                                                    <LogOut className="w-4 h-4" /> Terminate Session
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-6 border border-border border-dashed rounded-[2rem] p-12 bg-muted/10">
                                            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                                                <UserIcon className="w-8 h-8 text-muted-foreground/50" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">No Active Session</h3>
                                                <p className="text-muted-foreground max-w-sm mx-auto">Authenticate your profile to synchronize notes and unlock AI-driven job searching capabilities.</p>
                                            </div>
                                            <Button onClick={handleGoogleSignIn} disabled={loading} size="lg" className="mx-auto rounded-2xl px-10 gap-3">
                                                <Cloud className="w-5 h-5" /> Sign In with Google
                                            </Button>
                                        </div>
                                    )}
                                </GlassCard>

                                <GlassCard className="p-10 border-destructive/20 bg-destructive/5 rounded-[3rem]">
                                    <div className="flex items-start justify-between gap-6">
                                        <div>
                                            <h2 className="text-xl font-black mb-2 text-destructive uppercase tracking-tighter">Danger Zone</h2>
                                            <p className="text-sm text-destructive/70 font-medium">Permanently delete your account and wipe all synchronized intelligence assets. This action is irreversible.</p>
                                        </div>
                                        <Button variant="danger" disabled={!user} className="shrink-0 gap-2 font-bold px-6 py-6 rounded-2xl shadow-lg">
                                            <Trash2 className="w-5 h-5" /> Purge Account
                                        </Button>
                                    </div>
                                </GlassCard>
                            </>
                        )}

                        {/* Tab: Preferences */}
                        {activeTab === "preferences" && (
                            <GlassCard className="p-10 border-border rounded-[3rem] shadow-sm animate-fade-in">
                                <h2 className="text-2xl font-black tracking-tight mb-8">Interface & Styling</h2>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-background border border-border rounded-[2rem]">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Visual Theme</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Select your preferred color scheme for long working sessions.</p>
                                        </div>
                                        <ThemeToggle />
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-background border border-border rounded-[2rem] opacity-70">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Advanced Animations</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Reduce structural motion for a more rigid interface experience.</p>
                                        </div>
                                        <div className="px-4 py-2 bg-muted rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground">Enabled</div>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {/* Tab: Data & Storage */}
                        {activeTab === "data" && (
                            <GlassCard className="p-10 border-border rounded-[3rem] shadow-sm animate-fade-in">
                                <h2 className="text-2xl font-black tracking-tight mb-8">Asset Management</h2>
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-background border border-border rounded-[2rem] gap-6">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Local Note Cache</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Your current documents dictate temporary browser space.</p>
                                        </div>
                                        <Button variant="outline" onClick={handleClearLocalData} className="shrink-0 gap-2 border-border hover:bg-foreground hover:text-background rounded-xl">
                                            <Trash2 className="w-4 h-4" /> Purge Cache
                                        </Button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-background border border-border rounded-[2rem] gap-6">
                                        <div>
                                            <h3 className="font-bold text-lg mb-1">Export Library</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Download a complete backup JSON archive of your synthesized knowledge base.</p>
                                        </div>
                                        <Button onClick={handleExportData} className="shrink-0 gap-2 rounded-xl px-6">
                                            <DownloadCloud className="w-5 h-5" /> Compile Backup
                                        </Button>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
}
