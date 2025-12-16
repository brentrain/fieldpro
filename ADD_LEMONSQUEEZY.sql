-- Add LemonSqueezy link to company_profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS lemonsqueezy_link TEXT;

