-- Add recruiter_notes column to public_applications table
ALTER TABLE public.public_applications
ADD COLUMN IF NOT EXISTS recruiter_notes TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_public_applications_recruiter_notes ON public.public_applications(recruiter_notes);

-- Add RLS policy for recruiter notes
CREATE POLICY "Recruiters can update notes for their public applications" ON public.public_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    JOIN public.job_postings jp ON jp.recruiter_id = r.id
    WHERE jp.id = public_applications.job_id
    AND r.user_id = auth.uid()
  )
);

-- Add RLS policy for reading notes
CREATE POLICY "Recruiters can read notes for their public applications" ON public.public_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    JOIN public.job_postings jp ON jp.recruiter_id = r.id
    WHERE jp.id = public_applications.job_id
    AND r.user_id = auth.uid()
  )
); 