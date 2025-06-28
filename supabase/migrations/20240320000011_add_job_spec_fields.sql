-- Add job specification fields to applications table
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS job_spec TEXT,
ADD COLUMN IF NOT EXISTS job_spec_url TEXT;

-- Update RLS policies to allow job spec updates
CREATE POLICY "Users can update their own job specifications"
    ON public.applications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 