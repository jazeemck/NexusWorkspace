"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Search, 
  TrendingUp, 
  Upload, 
  MapPin, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Bookmark,
  ChevronRight,
  Filter,
  X,
  FileText,
  Sparkles,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  isRemote: boolean;
  description: string;
  url: string;
  skills: string[];
  matchScore?: number;
  source?: string;
}

export default function JobSearchClient({ user }: { user: { id: string; email?: string } }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [profileText, setProfileText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const [selectedJobForAI, setSelectedJobForAI] = useState<Job | null>(null);
  const [aiCoverLetter, setAiCoverLetter] = useState("");
  const [isGeneratingCL, setIsGeneratingCL] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    const url = new URL("/api/jobs", window.location.origin);
    url.searchParams.append("query", searchTerm);
    url.searchParams.append("location", location);
    if (extractedSkills.length > 0) {
      url.searchParams.append("resumeSkills", extractedSkills.join(","));
    }

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Non-JSON jobs response:", text);
        throw new Error("Job search service current offline. Please try again.");
      }

      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
      if ((Array.isArray(data) ? data : []).length === 0) {
        toast.error("No jobs found matching your criteria.");
      } else {
        toast.success(`Found ${data.length} jobs!`);
      }
    } catch (err) {
      console.error("Search Error:", err);
      toast.error("Failed to connect to job search service.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeProfile = async (file?: File) => {
    if (!file && !profileText.trim()) {
      toast.error("Please provide a resume or profile text");
      return;
    }
    setIsAnalyzing(true);
    const loadingToast = toast.loading(file ? `Analyzing ${file.name}...` : "Analyzing profile...");
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("content", profileText);
      }
      formData.append("action", "extract-skills");

      const res = await fetch("/api/analyze-profile", { method: "POST", body: formData });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error("Server error: Intelligence node returned an invalid response. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || "Upload or analysis failed");
      }
      
      let skills: string[] = [];
      try {
        const cleaned = typeof data.result === "string" ? JSON.parse(data.result.replace(/```json\s*|```/g, "").trim()) : data.result;
        skills = cleaned || [];
      } catch (e) { console.error(e); }

      if (Array.isArray(skills) && skills.length > 0) {
        setExtractedSkills(skills);
        setSearchTerm(skills.slice(0, 3).join(", "));
        setShowAnalysis(true);
        toast.success(`Interpreted ${skills.length} skills!`);
      } else {
        setShowAnalysis(true);
        setExtractedSkills([]);
        toast.success("Ready for search adjustments.");
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
      toast.error(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
      toast.dismiss(loadingToast);
    }
  };

  const generateCoverLetter = async (job: Job) => {
    if (!profileText && extractedSkills.length === 0) {
        toast.error("Input your profile text or upload a resume first!");
        return;
    }
    setSelectedJobForAI(job);
    setIsGeneratingCL(true);
    setAiCoverLetter("");
    const loadToast = toast.loading(`Synthesizing tailored letter for ${job.title}...`);
    
    try {
        const formData = new FormData();
        formData.append("content", profileText || `Skills: ${extractedSkills.join(", ")}`);
        formData.append("action", "generate-cover-letter");
        formData.append("targetRole", `${job.title} at ${job.company}`);

        const res = await fetch("/api/analyze-profile", { method: "POST", body: formData });
        const contentType = res.headers.get("content-type");
        
        if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text();
            console.error("Non-JSON CL response:", text);
            throw new Error("Synthesis node offline.");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Synthesis failed");
        
        const parsed = typeof data.result === "string" ? JSON.parse(data.result.replace(/```json\s*|```/g, "").trim()) : data.result;
        setAiCoverLetter(parsed.coverLetter);
        toast.success("AI Synthesis Complete", { id: loadToast });
    } catch (err) {
        console.error(err);
        toast.error("Intelligence node fail.", { id: loadToast });
    } finally {
        setIsGeneratingCL(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-24 min-h-screen">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-foreground/40" />
          </div>
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Intelligence Matrix</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
          AI <span className="text-muted-foreground/30 text-opacity-10">JOBS</span>.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl font-medium leading-relaxed italic opacity-70">
          Precision matching for the next tier of human-AI collaboration.
        </p>
      </motion.div>

      {/* Advanced Search Bar */}
      <section className="mb-20">
        <div className="bg-card border border-border/50 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group focus-within:border-foreground/10 transition-all">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4 relative z-10">
            <div className="flex-1 flex items-center px-4 w-full">
              <Search className="w-6 h-6 text-muted-foreground/40 mr-4" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Skills, Roles, or Companies..." 
                className="w-full bg-transparent border-none text-xl font-bold py-4 focus:ring-0 outline-none placeholder:text-muted-foreground/20"
              />
            </div>
            
            <div className="h-8 w-[1px] bg-border/50 hidden md:block" />
            
            <div className="flex-1 flex items-center px-4 w-full">
              <MapPin className="w-6 h-6 text-muted-foreground/40 mr-4" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location or 'Remote'..." 
                className="w-full bg-transparent border-none text-xl font-bold py-4 focus:ring-0 outline-none placeholder:text-muted-foreground/20"
              />
            </div>

            <button type="submit" className="bg-foreground text-background px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all text-sm flex items-center gap-3">
                Execute <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          
          <div className="flex items-center gap-8 mt-4 px-6 pb-2">
            <label className="flex items-center gap-3 cursor-pointer group/toggle">
              <input type="checkbox" checked={isRemote} onChange={() => setIsRemote(!isRemote)} className="hidden" />
              <div className={cn("w-10 h-6 rounded-full transition-all relative", isRemote ? "bg-black" : "bg-black/10")}>
                <motion.div animate={{ x: isRemote ? 18 : 3 }} className="w-4 h-4 bg-white rounded-full absolute top-1" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Remote Only</span>
            </label>
            
            <div className={cn(
              "flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer relative overflow-hidden group/upload",
              isAnalyzing ? "text-foreground opacity-100" : "text-muted-foreground/40 hover:text-foreground"
            )}>
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isAnalyzing ? "Synthesizing..." : "Synthesize Resume"}</span>
              <input 
                type="file" 
                accept=".txt,.pdf,.docx" 
                disabled={isAnalyzing}
                onChange={(e) => { 
                  const f = e.target.files?.[0]; 
                  if (f) handleAnalyzeProfile(f); 
                  // Reset input value so the same file can be uploaded again if needed
                  e.target.value = '';
                }} 
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <div className="space-y-12">
        {loading ? (
          <div className="grid gap-8">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-64 bg-foreground/5 rounded-[3rem] animate-pulse" />)}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30">{jobs.length} POTENTIAL MATCHES</h2>
              <button className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                <Filter className="w-4 h-4" /> Refine Stream
              </button>
            </div>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onGenerateCL={() => generateCoverLetter(job)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-border/50 rounded-[4rem] bg-foreground/[0.02]">
            <Zap className="w-16 h-16 text-muted-foreground/10 mx-auto mb-8" />
            <p className="text-muted-foreground font-black uppercase tracking-[0.6em] opacity-20">AWAITING SYSTEM INITIALIZATION</p>
            <p className="text-xs font-bold mt-6 text-muted-foreground/40 uppercase tracking-widest">Execute search to populate the opportunity field.</p>
          </div>
        )}
      </div>

      {/* Intelligence Dashboard */}
      <div className="grid lg:grid-cols-3 gap-10 mt-32">
        <div className="col-span-2 bg-foreground/[0.03] border border-border/50 rounded-[3.5rem] p-12 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
                <Target className="w-6 h-6 text-foreground" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Profile Synthesis</h3>
            </div>
            <p className="text-muted-foreground font-medium mb-10 leading-relaxed max-w-xl">
                 Feed the system your latest coordinates (projects, summaries, or LinkedIn data) to calibrate the matching algorithm.
            </p>
            <textarea 
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                className="w-full bg-white/50 border border-border/50 rounded-3xl p-8 min-h-[220px] outline-none focus:border-foreground/30 transition-all text-sm font-medium shadow-inner"
                placeholder="Experience with Orbital UI, Neural Bridges, and high-frequency knowledge graphs..."
            />
            <div className="flex items-center gap-4 mt-10">
                <button onClick={() => handleAnalyzeProfile()} disabled={isAnalyzing} className="bg-black text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl disabled:opacity-50">
                    {isAnalyzing ? "Processing..." : "Calibrate Matrix"}
                </button>
            </div>
            
            <AnimatePresence>
                {showAnalysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 pt-12 border-t border-border/50">
                    <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">CALIBRATED SKILLS</h4>
                        <span className="text-[10px] bg-black/10 px-3 py-1 rounded-full text-black/40 font-black">{extractedSkills.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-10">
                    {extractedSkills.map(s => (
                        <span key={s} className="bg-white border border-border text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-black transition-all">
                            {s}
                        </span>
                    ))}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="bg-black text-white rounded-[3.5rem] p-12 flex flex-col relative overflow-hidden shadow-2xl">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-[100px]"
          />
          <div className="flex items-center gap-4 mb-12 relative z-10">
            <TrendingUp className="w-6 h-6 text-white" />
            <h3 className="text-xs font-black uppercase tracking-[0.4em]">TREND CALIBRATION</h3>
          </div>
          <div className="space-y-8 relative z-10">
            {[
              { skill: "Neural RAG", trend: "+240%", color: "text-green-400" },
              { skill: "Local LLMs", trend: "+112%", color: "text-green-400" },
              { skill: "Vector Design", trend: "+88%", color: "text-white/60" },
              { skill: "Web3 Identity", trend: "-12%", color: "text-red-400" }
            ].map(s => (
              <div key={s.skill} className="flex justify-between items-center pb-6 border-b border-white/10 group cursor-default">
                <span className="text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{s.skill}</span>
                <span className={cn("text-[10px] font-black tracking-tighter", s.color)}>{s.trend}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-10">
              <p className="text-[10px] text-white/20 font-medium leading-relaxed italic uppercase tracking-widest">Global skill frequency is currently favoring high-reasoning nodes and specialized architecture.</p>
          </div>
        </div>
      </div>

      {/* AI Cover Letter Modal */}
      <AnimatePresence>
        {selectedJobForAI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white text-black w-full max-w-3xl rounded-[4rem] p-12 relative shadow-2xl max-h-[85vh] overflow-y-auto"
            >
                <button 
                  onClick={() => setSelectedJobForAI(null)}
                  className="absolute top-10 right-10 p-3 hover:bg-black/5 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 mb-12">
                   <Sparkles className="w-8 h-8 text-black" />
                   <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">AI Synthesis Brief</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-black/40">Custom Tailored Cover Letter for {selectedJobForAI.title}</p>
                   </div>
                </div>

                {isGeneratingCL ? (
                  <div className="py-20 text-center space-y-6">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-[0.6em] text-black/20 animate-pulse">GENERATING TAILORED INTELLIGENCE...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                     <div className="prose max-w-none">
                        <div className="p-10 bg-black/[0.02] border border-black/5 rounded-[3rem] whitespace-pre-wrap text-sm font-medium leading-relaxed font-serif italic text-black/80">
                           {aiCoverLetter}
                        </div>
                     </div>
                     <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aiCoverLetter);
                            toast.success("Intelligence copied to clipboard.");
                          }}
                          className="bg-black text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                        >
                           Copy Letter
                        </button>
                        <button 
                          onClick={() => setSelectedJobForAI(null)}
                          className="px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-all"
                        >
                           Dismiss
                        </button>
                     </div>
                  </div>
                )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function JobCard({ job, onGenerateCL }: { job: Job, onGenerateCL: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white border border-border/50 rounded-[4rem] p-12 flex flex-col md:flex-row gap-12 hover:border-black/10 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] relative group"
    >
      <div className="w-24 h-24 bg-black/[0.02] rounded-3xl flex-shrink-0 flex items-center justify-center border border-border/20 p-6 group-hover:bg-black group-hover:text-white transition-all duration-500">
        <Briefcase className="w-10 h-10 opacity-20 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{job.title}</h3>
                {job.matchScore !== undefined && job.matchScore >= 85 && (
                    <span className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest animate-pulse">PREMIUM FIT</span>
                )}
            </div>
            <div className="flex items-center gap-2">
                <p className="font-black text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40">{job.company}</p>
                {job.source && (
                    <>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <p className="font-black text-[10px] uppercase tracking-[0.4em] text-blue-500/60 transition-colors group-hover:text-blue-500">{job.source}</p>
                    </>
                )}
            </div>
          </div>
          <button className="text-muted-foreground/20 hover:text-black transition-colors p-3">
              <Bookmark className="w-8 h-8" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-8 mb-10">
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            <Clock className="w-4 h-4" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {job.skills.map(skill => (
            <span key={skill} className="text-[9px] font-black uppercase tracking-tighter bg-foreground/[0.03] px-3 py-1.5 rounded-xl border border-border/20 text-muted-foreground/60 transition-all hover:bg-black hover:text-white hover:border-black">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-4 justify-center md:border-l border-border/50 md:pl-12 min-w-[200px]">
        <a 
          href={job.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/10"
        >
          APPLY DIRECTLY <ExternalLink className="w-4 h-4" />
        </a>
        <button 
          onClick={(e) => { e.stopPropagation(); onGenerateCL(); }}
          className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 hover:text-black transition-all group/sc"
        >
          <Sparkles className="w-4 h-4 opacity-0 group-hover/sc:opacity-100 transition-opacity" /> AI Synthesis
        </button>
      </div>
    </motion.div>
  );
}
