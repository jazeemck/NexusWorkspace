"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Send, Mail, MapPin, Clock, Twitter, Linkedin, Github, ChevronDown, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const faqs = [
    {
      q: "How does the AI intelligence quota work?",
      a: "Nexus provides a free daily baseline tier utilizing high-speed flash models. If you exhaust the primary models, our system will automatically failover to secondary partner models to keep your workspace online. Heavy users may want to upgrade their tier."
    },
    {
      q: "Are my local documents uploaded to the cloud?",
      a: "No. For PDF and DOCX files, Nexus parses and reads the text entirely in your browser using local processors. Only the extracted text representation is sent to the AI for summarization, meaning the actual file never touches our servers."
    },
    {
      q: "Can I retrieve my data if I delete my account?",
      a: "Once an account deletion is initiated, data is irretrievably wiped within 30 days. We strongly recommend exporting your notes and summaries manually before confirming account deletion."
    },
    {
      q: "Do you offer tailored platforms for enterprise teams?",
      a: "Yes. Reach out to us via the contact form and select 'Billing / Enterprise' as the subject. Our team will contact you to discuss custom deployment options and increased API limits."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-stretch transition-all duration-300 overflow-x-hidden selection:bg-foreground selection:text-background">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-24 md:py-32 flex flex-col gap-16 relative">
        <div className="space-y-4 max-w-2xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">Get in Touch</h1>
          <p className="text-xl text-muted-foreground font-medium">
            We're here to help. Reach out anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
          {/* Left Column: Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-card border border-border rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 h-[400px]">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold">Message Received</h3>
                <p className="text-muted-foreground">
                  Thank you for reaching out to Nexus. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border p-8 rounded-3xl space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Jane Doe"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="jane@example.com"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Subject</label>
                  <select 
                    required
                    defaultValue=""
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select an option</option>
                    <option value="general">General Inquiry</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing / Enterprise</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold">Message</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-foreground/50 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-foreground text-background font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border p-8 rounded-3xl space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4 text-muted-foreground">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 text-foreground">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-medium">support@nexusworkspace.com</span>
                  </li>
                  <li className="flex items-center gap-4 text-muted-foreground">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 text-foreground">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Bengaluru, India</span>
                  </li>
                  <li className="flex items-center gap-4 text-muted-foreground">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 text-foreground">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Reply within 24 hours</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Follow Nexus</h3>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <button 
                key={index} 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full bg-card border border-border rounded-2xl overflow-hidden transition-all text-left"
              >
                <div className="p-6 flex items-center justify-between gap-4 font-bold">
                  {faq.q}
                  <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </div>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
