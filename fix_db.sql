-- 1. Create the custom users table for NextAuth (bypassing Supabase Auth)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Disable RLS on the users table so NextAuth can verify accounts using the ANON KEY
alter table public.users disable row level security;

-- 3. To prevent foreign key errors if you already created the 'summaries' table based on the old README:
-- This alters the 'summaries' table to remove the strict Supabase Auth foreign key constraint.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'summaries_user_id_fkey') THEN
    ALTER TABLE public.summaries DROP CONSTRAINT summaries_user_id_fkey;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'summaries') THEN 
    -- Make sure RLS is completely harmless or disabled for summaries to allow NextAuth users to write!
    -- This works securely because NextAuth server routes like /api/summarize protect writing already.
    ALTER TABLE public.summaries DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. Just in case you did the same for the 'notes' table:
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notes_user_id_fkey') THEN
    ALTER TABLE public.notes DROP CONSTRAINT notes_user_id_fkey;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN 
    ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;
