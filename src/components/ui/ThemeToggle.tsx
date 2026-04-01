"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return null;

    const options = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "system", icon: Monitor, label: "System" },
        { value: "dark", icon: Moon, label: "Dark" },
    ];

    return (
        <div className={cn("flex items-center gap-1 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] p-1 shadow-sm", className)}>
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        title={opt.label}
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md transition-all",
                            isActive
                                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                                : "text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white"
                        )}
                    >
                        <Icon size={14} />
                    </button>
                );
            })}
        </div>
    );
}
