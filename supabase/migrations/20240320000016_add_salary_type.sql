-- Add salary_type field to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN salary_type TEXT DEFAULT 'annual' CHECK (salary_type IN ('annual', 'monthly'));

-- Add comment to explain the field
COMMENT ON COLUMN public.job_postings.salary_type IS 'Whether the salary range is annual or monthly'; 