import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr?: string | null): string {
  try {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/")[2];
    if (parsed.pathname.startsWith("/live/")) return parsed.pathname.split("/")[2];
    const vParam = parsed.searchParams.get("v");
    if (vParam) return vParam;
    
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
        const last = segments[segments.length - 1];
        if (last.length === 11) return last;
    }
    return null;
  } catch {
    return null;
  }
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function isValidYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/(shorts|live)\/)([\w-]{11})/i.test(url);
}
