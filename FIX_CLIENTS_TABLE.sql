-- FIX CLIENTS TABLE - Run this in Supabase SQL Editor
-- This will create the clients table and allow you to add clients

-- Step 1: Create clients table (explicitly in public schema)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add columns if they don't exist (for existing tables)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;

-- Step 3: Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop ALL existing policies (clean slate)
DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to view clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to update clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated users to delete clients" ON public.clients;

-- Step 5: Create a single policy that allows ALL operations for authenticated users
CREATE POLICY "Allow all operations on clients"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 6: Grant explicit permissions
GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.clients TO anon;

-- Step 7: Verify table exists (forces schema cache refresh)
DO $$
BEGIN
  PERFORM 1 FROM public.clients LIMIT 1;
  RAISE NOTICE 'Clients table verified successfully!';
END $$;

-- Step 8: Test insert (optional - comment out if you want)
-- INSERT INTO public.clients (name) VALUES ('Test Client') ON CONFLICT DO NOTHING;

