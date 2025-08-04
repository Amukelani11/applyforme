-- Fix missing columns for applications
-- Run this in your Supabase SQL editor

-- Add ai_score column to candidate_applications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidate_applications' 
        AND column_name = 'ai_score'
    ) THEN
        ALTER TABLE public.candidate_applications ADD COLUMN ai_score INTEGER;
    END IF;
END $$;

-- Add ai_score column to public_applications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'public_applications' 
        AND column_name = 'ai_score'
    ) THEN
        ALTER TABLE public.public_applications ADD COLUMN ai_score INTEGER;
    END IF;
END $$;

-- Add phone column to public_applications if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'public_applications' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.public_applications ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_applications_ai_score ON public.candidate_applications(ai_score);
CREATE INDEX IF NOT EXISTS idx_public_applications_ai_score ON public.public_applications(ai_score);
CREATE INDEX IF NOT EXISTS idx_public_applications_phone ON public.public_applications(phone);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view their own applications" ON public.candidate_applications;
CREATE POLICY "Users can view their own applications" ON public.candidate_applications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON public.candidate_applications;
CREATE POLICY "Recruiters can view applications for their jobs" ON public.candidate_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE jp.id = candidate_applications.job_posting_id
            AND r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Recruiters can update applications for their jobs" ON public.candidate_applications;
CREATE POLICY "Recruiters can update applications for their jobs" ON public.candidate_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE jp.id = candidate_applications.job_posting_id
            AND r.user_id = auth.uid()
        )
    );

-- Public applications policies
DROP POLICY IF EXISTS "Recruiters can view public applications for their jobs" ON public.public_applications;
CREATE POLICY "Recruiters can view public applications for their jobs" ON public.public_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE jp.id = public_applications.job_id
            AND r.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Recruiters can update public applications for their jobs" ON public.public_applications;
CREATE POLICY "Recruiters can update public applications for their jobs" ON public.public_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.recruiters r ON jp.recruiter_id = r.id
            WHERE jp.id = public_applications.job_id
            AND r.user_id = auth.uid()
        )
    );

-- Verify the columns were added
SELECT 'Migration completed successfully!' as status; 