// Color theme definitions for the radial orbital timeline
export type ColorTheme = "indigo" | "purple" | "emerald" | "blue";

export interface ThemeColors {
    primary: string;
    primaryHex: string;
    primaryLight: string;
    primaryLightHex: string;
    primaryGlow: string;
    gradient: string;
    nodeActive: string;
    nodeRelated: string;
}

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
    indigo: {
        primary: "text-indigo-500",
        primaryHex: "#6366f1",
        primaryLight: "text-indigo-400",
        primaryLightHex: "#818cf8",
        primaryGlow: "rgba(99, 102, 241, 0.4)",
        gradient: "from-indigo-500 via-violet-500 to-purple-500",
        nodeActive: "bg-indigo-500 border-indigo-400",
        nodeRelated: "bg-indigo-500/30 border-indigo-400",
    },
    purple: {
        primary: "text-purple-500",
        primaryHex: "#a855f7",
        primaryLight: "text-purple-400",
        primaryLightHex: "#c084fc",
        primaryGlow: "rgba(168, 85, 247, 0.4)",
        gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
        nodeActive: "bg-purple-500 border-purple-400",
        nodeRelated: "bg-purple-500/30 border-purple-400",
    },
    emerald: {
        primary: "text-emerald-500",
        primaryHex: "#10b981",
        primaryLight: "text-emerald-400",
        primaryLightHex: "#34d399",
        primaryGlow: "rgba(16, 185, 129, 0.4)",
        gradient: "from-emerald-500 via-teal-500 to-cyan-500",
        nodeActive: "bg-emerald-500 border-emerald-400",
        nodeRelated: "bg-emerald-500/30 border-emerald-400",
    },
    blue: {
        primary: "text-blue-500",
        primaryHex: "#3b82f6",
        primaryLight: "text-blue-400",
        primaryLightHex: "#60a5fa",
        primaryGlow: "rgba(59, 130, 246, 0.4)",
        gradient: "from-blue-500 via-sky-500 to-cyan-500",
        nodeActive: "bg-blue-500 border-blue-400",
        nodeRelated: "bg-blue-500/30 border-blue-400",
    },
};

export const DEFAULT_COLOR_THEME: ColorTheme = "indigo";
