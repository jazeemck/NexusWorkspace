"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPageLayout({ title, lastUpdated, sections }: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the visible section that intersects the most or first
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break; // Active section found
          }
        }
      },
      { rootMargin: "-20% 0px -80% 0px" } // Triggers when element is near top
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100, // Offset for navbar
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-stretch transition-all duration-300 overflow-x-hidden selection:bg-foreground selection:text-background">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row gap-12 relative">
        {/* Left Content Column */}
        <div className="flex-1 max-w-[720px]">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">{title}</h1>
          <p className="text-muted-foreground font-medium mb-16">Last updated: {lastUpdated}</p>

          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight mb-6">{section.title}</h2>
                <div className="text-muted-foreground leading-loose space-y-4">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Right Sticky TOC Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 px-4">
              On this page
            </h3>
            <ul className="space-y-1 relative border-l border-border/50 ml-4 py-2">
              {sections.map((section) => (
                <li key={section.id} className="relative">
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => scrollTo(section.id, e)}
                    className={`block pl-4 py-2 text-sm transition-colors ${
                      activeSection === section.id
                        ? "text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {section.title}
                  </a>
                  {activeSection === section.id && (
                    <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-foreground rounded-full" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
