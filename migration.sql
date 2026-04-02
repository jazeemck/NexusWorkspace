-- 1. Fix the users table (ensure RLS is off for manual auth)
alter table if exists public.users disable row level security;

-- 2. Fix the notes table schema
-- Rename old columns to match new code if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'is_pinned') THEN
    ALTER TABLE public.notes RENAME COLUMN is_pinned TO pinned;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'is_favorite') THEN
    ALTER TABLE public.notes RENAME COLUMN is_favorite TO favorite;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'folder_id') THEN
    ALTER TABLE public.notes RENAME COLUMN folder_id TO folder;
    -- Change type if it was a UUID ref (assuming the code expects text)
    ALTER TABLE public.notes ALTER COLUMN folder TYPE text;
  END IF;

  -- Add missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'tags') THEN
    ALTER TABLE public.notes ADD COLUMN tags text[] DEFAULT array[]::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'folder') THEN
    ALTER TABLE public.notes ADD COLUMN folder text DEFAULT 'General';
  END IF;
END $$;

-- Ensure RLS is disabled for notes
alter table public.notes disable row level security;

-- 3. Fix summaries table (ensure RLS is off)
alter table if exists public.summaries disable row level security;
