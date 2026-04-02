-- 1. Create the custom users table for NextAuth (bypassing Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Disable RLS on the users table
alter table public.users disable row level security;

-- 2. Create the summaries table if it doesn't exist
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Link to public.users.id
  youtube_url text not null,
  video_title text,
  thumbnail_url text,
  tldr text,
  key_takeaways jsonb default '[]'::jsonb,
  sentiment text,
  sentiment_score float default 0,
  action_items jsonb default '[]'::jsonb,
  raw_content text,
  content_source text default 'transcript',
  created_at timestamptz default now()
);

-- Disable RLS for summaries
alter table public.summaries disable row level security;

-- 3. Create the notes table if it doesn't exist
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Modified to text to support both UUID and social IDs
  title text default 'Untitled Note',
  content text default '', -- Content can be rich text or JSON string
  folder_id text default 'General',
  is_favorite boolean default false,
  is_pinned boolean default false,
  last_edited_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Disable RLS for notes
alter table public.notes disable row level security;

-- 4. Clean up any existing foreign key constraints that might block NextAuth users (who aren't in auth.users)
DO $$ 
BEGIN
  -- Summaries FK
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'summaries_user_id_fkey') THEN
    ALTER TABLE public.summaries DROP CONSTRAINT summaries_user_id_fkey;
  END IF;
  
  -- Notes FK
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notes_user_id_fkey') THEN
    ALTER TABLE public.notes DROP CONSTRAINT notes_user_id_fkey;
  END IF;
END $$;
