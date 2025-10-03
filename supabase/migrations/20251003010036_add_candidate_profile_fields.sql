/*
  # Add Extended Candidate Profile Fields

  1. Changes
    - Add `transportation` (text) - Transportation method
    - Add `hobbies` (text[]) - Array of hobbies
    - Add `quick_facts` (text[]) - Array of quick facts
    - Add `prompts` (jsonb) - Structured profile prompts/questions
    - Add `photos` (text[]) - Array of photo URLs
    - Add `achievements` (text) - Career achievements
    - Add `experience` (jsonb) - Structured work experience data
    - Add `hourly_rate` (text) - Hourly rate for contract work
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'transportation'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN transportation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'hobbies'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN hobbies text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'quick_facts'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN quick_facts text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'prompts'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN prompts jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'photos'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN photos text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'achievements'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN achievements text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'experience'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN experience jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidate_profiles' AND column_name = 'hourly_rate'
  ) THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN hourly_rate text;
  END IF;
END $$;