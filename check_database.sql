-- Diagnostic Script: Check Database Setup
-- Run this in Supabase SQL Editor to verify your tables and policies are set up correctly

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('clients', 'invoices', 'invoice_items', 'company_profiles') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('clients', 'invoices', 'invoice_items', 'company_profiles')
ORDER BY table_name;

-- 2. Check if RLS is enabled on clients table
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'clients';

-- 3. Check RLS policies on clients table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'clients'
ORDER BY policyname;

-- 4. Check columns in clients table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

-- 5. Count records in each table (if they exist)
SELECT 
  'clients' as table_name,
  COUNT(*) as record_count
FROM clients
UNION ALL
SELECT 
  'invoices' as table_name,
  COUNT(*) as record_count
FROM invoices
UNION ALL
SELECT 
  'invoice_items' as table_name,
  COUNT(*) as record_count
FROM invoice_items
UNION ALL
SELECT 
  'company_profiles' as table_name,
  COUNT(*) as record_count
FROM company_profiles;

