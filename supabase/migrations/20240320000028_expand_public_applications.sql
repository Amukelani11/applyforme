-- Add columns for detailed application data to the public_applications table
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS work_experience JSONB,
ADD COLUMN IF NOT EXISTS education JSONB,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS cover_letter TEXT; 