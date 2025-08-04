-- Add is_read column to candidate_applications table
ALTER TABLE public.candidate_applications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add is_read column to public_applications table  
ALTER TABLE public.public_applications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add index for better performance when filtering by read status
CREATE INDEX IF NOT EXISTS idx_candidate_applications_is_read ON public.candidate_applications(is_read);
CREATE INDEX IF NOT EXISTS idx_public_applications_is_read ON public.public_applications(is_read);

-- Update RLS policies to allow recruiters to update read status
CREATE POLICY "Recruiters can update read status for their applications" ON public.candidate_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp 
            JOIN public.recruiters r ON jp.recruiter_id = r.id 
            WHERE jp.id = candidate_applications.job_posting_id 
            AND r.user_id = auth.uid()
        )
    );

CREATE POLICY "Recruiters can update read status for their public applications" ON public.public_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp 
            JOIN public.recruiters r ON jp.recruiter_id = r.id 
            WHERE jp.id = public_applications.job_id 
            AND r.user_id = auth.uid()
        )
    ); 