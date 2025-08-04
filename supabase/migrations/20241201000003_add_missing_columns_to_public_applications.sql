-- Add missing columns to public_applications table
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS custom_fields JSONB;

-- Add index for status column
CREATE INDEX IF NOT EXISTS idx_public_applications_status ON public.public_applications(status);

-- Add RLS policy for status updates
CREATE POLICY "Recruiters can update status for their public applications" ON public.public_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    JOIN public.job_postings jp ON jp.recruiter_id = r.id
    WHERE jp.id = public_applications.job_id
    AND r.user_id = auth.uid()
  )
);

-- Add RLS policy for reading status
CREATE POLICY "Recruiters can read status for their public applications" ON public.public_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    JOIN public.job_postings jp ON jp.recruiter_id = r.id
    WHERE jp.id = public_applications.job_id
    AND r.user_id = auth.uid()
  )
); 