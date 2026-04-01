# Nexus Workspace — Unified Intelligence Engine

Nexus Workspace is a premium, high-contrast intelligence platform designed for researchers, developers, and creators. It transforms any YouTube video into structured intelligence reports, manages a local knowledge base (Cloud Notes), and accelerates careers through AI-driven profile analysis.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Framer Motion · Supabase (Auth + DB) · Firecrawl · Google Gemini 2.x (Multi-Model Fallback)

---

## 🚀 Quick Deployment (Vercel)

1.  **Push to GitHub:** Code is already pushed to `jazeemck/NexusWorkspace`.
2.  **Connect to Vercel:** 
    - Go to [Vercel Dashboard](https://vercel.com/new).
    - Import the `NexusWorkspace` repository.
3.  **Add Environment Variables:** 
    - Copy the keys from your `.env.local`.
    - Ensure `NEXTAUTH_SECRET` is generated (`openssl rand -base64 32`).
    - Set `NEXTAUTH_URL` to your Vercel production URL (e.g., `https://nexus-workspace.vercel.app`).
4.  **Deploy:** Click Deploy.

---

## 🛠️ Infrastructure Setup

### 1. Supabase (Database & Auth)
Run this SQL in your [Supabase SQL Editor](https://app.supabase.com):

```sql
-- Summaries Table
create table public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  youtube_url text not null,
  video_title text,
  thumbnail_url text,
  tldr text,
  key_takeaways jsonb,
  sentiment text,
  sentiment_score float,
  action_items jsonb,
  raw_content text,
  content_source text default 'metadata',
  created_at timestamptz default now()
);

-- Notes Table
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content jsonb, -- Tiptap JSON format
  tags text[] default '{}',
  folder text default 'General',
  favorite boolean default false,
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. Environment Configuration
Required variables in `.env.local` (see `.env.local.example`):
- `GEMINI_API_KEY`: Verifed working with `gemini-2.5-flash` and `gemini-2.0-flash`.
- `FIRECRAWL_API_KEY`: Required for YouTube data extraction.
- `NEXTAUTH_SECRET`: Deployment security.
- `SUPABASE_SERVICE_ROLE_KEY`: Required for server-side DB operations.

---

## ✨ Features

- **🌐 Nexus Intelligence Engine**: Instant YouTube analysis using the state-of-the-art Gemini 2.5 pipeline.
- **📝 Cloud Notes**: A decentralized, local-first knowledge base with Tiptap editor and Cloud Sync.
- **🚀 Career Accelerator**: AI profile analysis to find market-fit opportunities.
- **🌓 Deep Aesthetics**: Premium minimalist dark mode with glassmorphism and performance-driven animations.
- **🔐 Unified Protocol**: Secure entry via NextAuth.js (Google OAuth + Credentials).

---

## 🏛️ Project Architecture
- `src/app/api/summarize`: Main AI synthesis pipeline.
- `src/app/api/notes`: Knowledge base CRUD operations.
- `src/app/api/analyze-profile`: Job/Skill alignment engine.
- `src/components/dashboard`: Core user interaction components.
- `src/lib/auth`: Unified authentication protocol.

---

Developed for the **Nexus Intelligence Network** v3.4.2.
