import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nexus Workspace — Unified AI Intelligence",
  description:
    "A comprehensive AI intelligence engine. Synthesize videos, organize local cloud notes, and accelerate your career with AI-driven job matching.",
  keywords: ["AI workspace", "YouTube summarizer", "cloud notes", "career accelerator", "AI job search", "knowledge base"],
  openGraph: {
    title: "Nexus Workspace — Unified AI Intelligence",
    description: "Synthesize videos, organize notes, and accelerate your career.",
    type: "website",
  },
};

import { Sidebar } from "@/components/navigation/Sidebar";
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased transition-colors duration-300`}>
        <AuthProvider>
          <ThemeProvider>
            <Sidebar />
            {children}
          </ThemeProvider>
        </AuthProvider>
        <ToastProvider />
      </body>
    </html>
  );
}
