"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Youtube,
    Cloud,
    Briefcase,
    BarChart,
    Settings,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Zap
} from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import { HoverTrigger } from "./HoverTrigger";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const pathname = usePathname();
    const router = useRouter();

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobileOpen) {
            requestAnimationFrame(() => setIsMobileOpen(false));
        }
    }, [pathname, isMobileOpen]);

    // Handle keyboard navigation (escape to close)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsMobileOpen(false);
                setIsExpanded(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleMouseEnter = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) setIsExpanded(true);
    };

    const handleMouseLeave = () => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) setIsExpanded(false);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
    };

    const mainNavItems = [
        { icon: Home, label: "Home", href: "/" },
        { icon: Youtube, label: "Summarizer", href: "/summarizer" },
        { icon: BarChart, label: "Intelligence", href: "/intelligence" },
        { icon: Briefcase, label: "AI Job Search", href: "/job-search" },
        { icon: Cloud, label: "Cloud Notes", href: "/notes" },
        { icon: Zap, label: "Features", href: "/features" },
    ];

    const bottomNavItems = [
        { icon: Settings, label: "Settings", href: "/settings" },
    ];

    return (
        <>
            {/* Mobile Menu Button - Fixed to Top Left */}
            <button
                suppressHydrationWarning
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-[160] p-3 rounded-2xl bg-background border border-border shadow-2xl text-foreground hover:bg-muted transition-all active:scale-95"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Invisible Hover Zone for Desktop Trigger */}
            <HoverTrigger onMouseEnter={handleMouseEnter} />

            {/* Mobile Backdrop Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-background/60 z-[140] backdrop-blur-md transition-opacity duration-500"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Navigation */}
            <nav
                onMouseLeave={handleMouseLeave}
                className={`
          fixed left-0 top-0 h-screen bg-background border-r border-border shadow-[40px_0_60px_-15px_rgba(0,0,0,0.1)] z-[150]
          flex flex-col
          transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          w-[300px]
          ${isExpanded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
          ${isMobileOpen ? "translate-x-0 opacity-100" : ""}
        `}
                aria-label="Main Navigation"
            >
                {/* Mobile Close Button inside sidebar */}
                <button
                    suppressHydrationWarning
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute top-6 right-6 p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all active:scale-95"
                    aria-label="Close menu"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Top Section / Header */}
                <div className="p-8 border-b border-border/50">
                    <Link
                        href="/"
                        className="flex items-center gap-4 group"
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <div className="bg-foreground w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center flex-shrink-0 text-background group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <div className="w-4 h-4 rounded-full border-[3px] border-background" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xs leading-tight text-foreground uppercase tracking-[0.25em]">
                                Nexus Workspace
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                                Unified Engine
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Main Navigation Links */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 px-4 opacity-40">
                            Navigation
                        </div>
                        <div className="space-y-2">
                            {mainNavItems.map((item) => {
                                let isActive = pathname === item.href;
                                
                                // Handle sub-routes
                                if (item.href !== "/" && pathname.startsWith(item.href)) {
                                    isActive = true;
                                }

                                // Special case for results - highlight Summarizer
                                if (pathname.startsWith("/result") && item.label === "Summarizer") {
                                    isActive = true;
                                }

                                return (
                                    <SidebarItem
                                        key={item.label}
                                        icon={item.icon}
                                        label={item.label}
                                        href={item.href}
                                        isActive={isActive}
                                        onClick={() => setIsMobileOpen(false)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* Bottom Section */}
                <div className="p-6 border-t border-border/50 space-y-2 mt-auto">
                    {bottomNavItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isActive={pathname === item.href}
                            onClick={() => setIsMobileOpen(false)}
                        />
                    ))}
                    {user && (
                        <button
                            suppressHydrationWarning
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 group bg-background text-muted-foreground border border-border hover:bg-destructive hover:text-white hover:-translate-y-1 hover:shadow-2xl hover:border-destructive"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0 transition-all duration-300 text-muted-foreground group-hover:text-white group-hover:scale-110" />
                            <span className="truncate text-xs font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                    )}
                </div>
            </nav>
        </>
    );
}
