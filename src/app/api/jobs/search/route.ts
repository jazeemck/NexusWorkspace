import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const remote = searchParams.get("remote") === "true";

  // Using Adzuna API as it's free/reliable for demos
  // App ID and Key should be in env, using placeholders for now
  const APP_ID = process.env.ADZUNA_APP_ID || "test";
  const APP_KEY = process.env.ADZUNA_APP_KEY || "test";
  
  try {
    console.log(`Searching for ${query} in ${location} (remote: ${remote})`);

    // Mock results if keys are missing
    if (APP_ID === "test" || APP_KEY === "test") {
      console.log("Using mock job data (API keys missing)");
      return NextResponse.json({
        results: [
          {
            id: "mock-1",
            title: `${query || "Data Scientist"}`,
            company: "Tech Intelligence Inc.",
            location: location || "Remote",
            salary: "₹1,200,000 - ₹2,400,000",
            type: "Full-time",
            isRemote: true,
            description: "Exciting opportunity to work on AI and large language models.",
            url: "#",
            skills: ["React", "TypeScript", "Next.js"]
          },
          {
            id: "mock-2",
            title: "Senior Software Engineer",
            company: "Global Digital Systems",
            location: "Bangalore",
            salary: "₹1,800,000 - ₹3,600,000",
            type: "Contract",
            isRemote: false,
            description: "Leading the development of a state-of-the-art career accelerator platform.",
            url: "#",
            skills: ["Python", "FastAPI", "Docker"]
          }
        ]
      });
    }

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}${remote ? "&remote=1" : ""}&content-type=application/json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`External API returned ${response.status}`);
    }
    const data = await response.json();

    return NextResponse.json({
      results: data.results?.map((job: { id: string; title: string; company: { display_name: string }; location: { display_name: string; area?: string[] }; salary_min?: number; salary_max?: number; contract_type?: string; description: string; redirect_url: string; created: string }) => ({
        id: job.id,
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        salary: job.salary_min ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max?.toLocaleString()}` : "Competitive",
        type: job.contract_type || "Full-time",
        isRemote: !!job.location.area?.find((a: string) => a.toLowerCase() === 'remote'),
        description: job.description,
        url: job.redirect_url,
        created: job.created,
        skills: [] 
      })) || []
    });
  } catch (error: { message?: string } | any) {
    console.error("Job Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs", details: error.message }, { status: 500 });
  }
}
