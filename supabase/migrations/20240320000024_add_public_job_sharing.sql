-- Add columns for public job sharing to the job_postings table

ALTER TABLE public.job_postings
ADD COLUMN IF NOT EXISTS public_share_id UUID UNIQUE DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS allow_public_applications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_application_count INTEGER DEFAULT 0;

-- Create an index on the public_share_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_postings_public_share_id ON public.job_postings(public_share_id); 