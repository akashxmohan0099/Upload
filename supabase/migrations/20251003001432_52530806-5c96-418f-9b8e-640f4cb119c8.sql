-- Add missing fields to candidate_profiles table for complete profile data
ALTER TABLE public.candidate_profiles
ADD COLUMN IF NOT EXISTS transportation text,
ADD COLUMN IF NOT EXISTS hobbies text[],
ADD COLUMN IF NOT EXISTS quick_facts text[],
ADD COLUMN IF NOT EXISTS prompts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS photos text[],
ADD COLUMN IF NOT EXISTS achievements text,
ADD COLUMN IF NOT EXISTS experience jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS hourly_rate text;