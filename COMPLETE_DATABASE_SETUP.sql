-- COMPLETE DATABASE SETUP - Run this ONCE in Supabase SQL Editor
-- This creates ALL tables you need: clients, invoices, invoice_items, company_profiles

-- ============================================================================
-- 1. CLIENTS TABLE (Required for everything else)
-- ============================================================================
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

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS zip_code TEXT;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on clients" ON public.clients;
CREATE POLICY "Allow all operations on clients"
  ON public.clients FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.clients TO authenticated;

-- ============================================================================
-- 2. INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  total_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
CREATE POLICY "Users can insert their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update their own invoices"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id);

GRANT ALL ON public.invoices TO authenticated;

-- ============================================================================
-- 3. INVOICE ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own invoice items" ON public.invoice_items;
CREATE POLICY "Users can view their own invoice items"
  ON public.invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE public.invoices.id = public.invoice_items.invoice_id
      AND public.invoices.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert their own invoice items" ON public.invoice_items;
CREATE POLICY "Users can insert their own invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE public.invoices.id = public.invoice_items.invoice_id
      AND public.invoices.user_id = auth.uid()
    )
  );

GRANT ALL ON public.invoice_items TO authenticated;

-- ============================================================================
-- 4. COMPANY PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  paypal_link TEXT,
  stripe_link TEXT,
  venmo_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own company profile" ON public.company_profiles;
CREATE POLICY "Users can view their own company profile"
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own company profile" ON public.company_profiles;
CREATE POLICY "Users can insert their own company profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own company profile" ON public.company_profiles;
CREATE POLICY "Users can update their own company profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

GRANT ALL ON public.company_profiles TO authenticated;

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- ============================================================================
-- 6. VERIFY ALL TABLES EXIST
-- ============================================================================
DO $$
BEGIN
  PERFORM 1 FROM public.clients LIMIT 1;
  PERFORM 1 FROM public.invoices LIMIT 1;
  PERFORM 1 FROM public.invoice_items LIMIT 1;
  PERFORM 1 FROM public.company_profiles LIMIT 1;
  RAISE NOTICE '✅ All tables created successfully!';
END $$;

