import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import UrlForm from "@/components/dashboard/UrlForm";

export default async function SummarizerPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background relative selection:bg-foreground selection:text-background font-sans transition-all duration-700">
      <Navbar />
      
      <div className="relative pt-48 pb-32 flex flex-col items-center justify-center bg-grid-subtle min-h-screen">
        <main className="max-w-5xl mx-auto px-6 w-full text-center space-y-12 animate-fade-in">
          {/* Header Section */}
          <div className="space-y-6">
            <p className="text-subtle">Sandbox Simulation</p>
            <h1 className="text-6xl md:text-8xl header-contrast leading-[1.05]">
              Intelligence <br /> <span>Synthesizer.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-60">
              Input video data for instant intelligence mapping.
            </p>
          </div>

          {/* Form Section */}
          <div className="max-w-4xl mx-auto w-full">
            <UrlForm />
          </div>
        </main>
      </div>
    </div>
  );
}
