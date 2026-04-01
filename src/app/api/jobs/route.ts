import { NextResponse } from "next/server";

// Dynamic mock data for the career accelerator
const jobs = [
  {
    id: "1",
    title: "Accountant",
    company: "Tech Intelligence Inc.",
    location: "Bangalore",
    type: "Full-Time",
    salary: "₹12L - ₹24L",
    skills: ["Accounting", "Excel"],
    url: "https://in.indeed.com/jobs?q=Accountant+Tech+Intelligence",
    source: "Indeed"
  },
  {
    id: "2",
    title: "Senior Software Engineer",
    company: "Global Digital Systems",
    location: "Bangalore",
    type: "Contract",
    salary: "₹18L - ₹36L",
    skills: ["React", "Node.js"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Senior+Software+Engineer+Global+Digital+Systems",
    source: "LinkedIn"
  },
  {
    id: "3",
    title: "Data Analyst",
    company: "Data Insight Group",
    location: "Remote",
    type: "Full-Time",
    salary: "₹15L - ₹30L",
    skills: ["SQL", "Python"],
    url: "https://internshala.com/jobs/keywords-data-analyst-data-insight-group",
    source: "Internshala"
  },
  {
    id: "4",
    title: "Product Manager",
    company: "Visionary Products",
    location: "Mumbai",
    type: "Full-Time",
    salary: "₹25L - ₹50L",
    skills: ["Product Strategy", "Agile"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Product+Manager+Visionary+Products",
    source: "LinkedIn"
  },
  {
    id: "5",
    title: "Python Developer",
    company: "Nexus AI Solutions",
    location: "Pune",
    type: "Full-Time",
    salary: "₹14L - ₹28L",
    skills: ["Python", "Django", "PostgreSQL"],
    url: "https://internshala.com/jobs/keywords-python-developer-nexus-ai",
    source: "Internshala"
  },
  {
    id: "6",
    title: "Frontend Architect",
    company: "Orbital UI Labs",
    location: "Remote",
    type: "Full-Time",
    salary: "₹30L - ₹55L",
    skills: ["Next.js", "TailwindCSS", "Framer Motion"],
    url: "https://www.linkedin.com/jobs/search/?keywords=Frontend+Architect+Orbital+UI+Labs",
    source: "LinkedIn"
  },
  {
    id: "7",
    title: "Cloud Infrastructure Specialist",
    company: "Skyward Systems",
    location: "Hyderabad",
    type: "Full-Time",
    salary: "₹20L - ₹40L",
    skills: ["AWS", "Terraform", "Kubernetes"],
    url: "https://in.indeed.com/jobs?q=Cloud+Infrastructure+Skyward+Systems",
    source: "Indeed"
  },
  {
    id: "8",
    title: "AI Research Scientist",
    company: "Neural Bridges",
    location: "San Francisco",
    type: "Full-Time",
    salary: "$150k - $280k",
    skills: ["PyTorch", "NLP", "LLMs"],
    url: "https://www.linkedin.com/jobs/search/?keywords=AI+Research+Scientist+Neural+Bridges",
    source: "LinkedIn"
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Normalize query parameters for case-insensitive partial matching
  const query = searchParams.get("query") || "";
  const locationParam = searchParams.get("location") || "";
  const resumeSkillsParam = searchParams.get("resumeSkills");
  
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedLocation = locationParam.toLowerCase().trim();
  const resumeSkills = resumeSkillsParam ? resumeSkillsParam.split(",").map(s => s.toLowerCase().trim()) : [];

  // Step 1: Filter from existing mock database
  let filteredJobs = jobs.filter((job) => {
    const matchTitle = job.title.toLowerCase().includes(normalizedQuery) || 
                       job.company.toLowerCase().includes(normalizedQuery) ||
                       job.skills.some(s => s.toLowerCase().includes(normalizedQuery));
    
    const matchLocation = job.location.toLowerCase().includes(normalizedLocation);

    return matchTitle && matchLocation;
  });

  // Step 2: "No-Fail" Logic - If no results found or user wants "all available", synthesize a robust list
  // Note: We always synthesize at least 15 jobs for a premium experience if the user provided search terms
  if (normalizedQuery || normalizedLocation) {
    const companies = ["NextGen Scaleups", "Horizon AI Systems", "Global Digital Hub", "Orbital Tech", "Nexus Solutions", "Synergy Labs", "Aether Corp", "Vortex Engineering", "Zenith Analytics"];
    const locations = [locationParam || "Remote", "Global / Hybrid", "Tech Park Sector 4", locationParam || "Satellite Hub"];
    
    const platforms = [
      { name: "LinkedIn", baseUrl: "https://www.linkedin.com/jobs/search/?keywords=" },
      { name: "Internshala", baseUrl: "https://internshala.com/jobs/keywords-" },
      { name: "Indeed", baseUrl: "https://in.indeed.com/jobs?q=" }
    ];

    const synthesizedCount = Math.max(15, filteredJobs.length);
    const additionalJobs = Array.from({ length: synthesizedCount - filteredJobs.length }, (_, i) => {
      const company = companies[i % companies.length];
      const location = locations[i % locations.length];
      const baseTitle = query.charAt(0).toUpperCase() + query.slice(1) || "Intelligence Specialist";
      const platform = platforms[i % platforms.length];
      
      let title = baseTitle;
      if (i % 3 === 0) title = `Senior ${baseTitle}`;
      if (i % 5 === 0) title = `Lead ${baseTitle}`;
      if (i % 7 === 0) title = `${baseTitle} Architect`;

      // Build platform-specific search URL
      let url = `${platform.baseUrl}${encodeURIComponent(title + " " + company)}`;
      if (platform.name === "Internshala") {
        url = `https://internshala.com/jobs/keywords-${encodeURIComponent(title.toLowerCase() + " " + company.toLowerCase()).replace(/%20/g, '-')}`;
      }

      return {
        id: `gen-${Date.now()}-${i}`,
        title,
        company,
        location,
        type: i % 4 === 0 ? "Contract" : "Full-Time",
        salary: i % 2 === 0 ? `₹${15 + i}L - ₹${30 + i * 2}L` : `₹${20 + i}L - ₹${45 + i}L`,
        skills: [query || "AI", "Cloud", "Execution", "Systems Design", "Scale"].slice(0, 3),
        url,
        source: platform.name
      };
    });

    filteredJobs = [...filteredJobs, ...additionalJobs];
  }

  // Step 3: Calculate Match Score (Fit Analysis)
  const enhancedJobs = filteredJobs.map((job) => {
    let matchScore = 0;

    if (resumeSkills.length > 0 && job.skills.length > 0) {
      const matchedSkills = job.skills.filter(jobSkill =>
        resumeSkills.some(userSkill => 
          userSkill.includes(jobSkill.toLowerCase()) || 
          jobSkill.toLowerCase().includes(userSkill)
        )
      );

      matchScore = Math.round((matchedSkills.length / job.skills.length) * 100);
    }

    return {
      ...job,
      matchScore
    };
  });

  // Step 4: Final Rank & Return
  enhancedJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  return NextResponse.json(enhancedJobs);
}
