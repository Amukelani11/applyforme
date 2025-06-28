-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own applications" ON public.candidate_applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their job postings" ON public.candidate_applications;
DROP POLICY IF EXISTS "Anyone can view active job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Recruiters can manage their own job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.candidate_applications
DROP CONSTRAINT IF EXISTS candidate_applications_job_posting_id_fkey,
DROP CONSTRAINT IF EXISTS fk_applications_job_posting;

ALTER TABLE public.candidate_applications
DROP CONSTRAINT IF EXISTS candidate_applications_user_id_fkey,
DROP CONSTRAINT IF EXISTS fk_applications_user;

ALTER TABLE public.job_postings
DROP CONSTRAINT IF EXISTS job_postings_recruiter_id_fkey,
DROP CONSTRAINT IF EXISTS fk_job_postings_recruiter;

ALTER TABLE public.recruiters
DROP CONSTRAINT IF EXISTS recruiters_user_id_fkey,
DROP CONSTRAINT IF EXISTS fk_recruiters_user;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey,
DROP CONSTRAINT IF EXISTS fk_users_auth;

-- Add status column to job_postings table
ALTER TABLE public.job_postings
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'draft', 'closed', 'expired'));

-- Add foreign key relationships with specific names

-- Add user_id foreign key to recruiters table
ALTER TABLE public.recruiters
ADD CONSTRAINT fk_recruiters_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add user_id foreign key to candidate_applications table
ALTER TABLE public.candidate_applications
ADD CONSTRAINT candidate_applications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add job_posting_id foreign key to candidate_applications table
ALTER TABLE public.candidate_applications
ADD CONSTRAINT candidate_applications_job_posting_id_fkey
FOREIGN KEY (job_posting_id)
REFERENCES public.job_postings(id)
ON DELETE CASCADE;

-- Add recruiter_id foreign key to job_postings table
ALTER TABLE public.job_postings
ADD CONSTRAINT fk_job_postings_recruiter
FOREIGN KEY (recruiter_id)
REFERENCES public.recruiters(id)
ON DELETE CASCADE;

-- Add user_id foreign key to users table
ALTER TABLE public.users
ADD CONSTRAINT fk_users_auth
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for candidate_applications
CREATE POLICY "Users can view their own applications"
ON public.candidate_applications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can view applications for their job postings"
ON public.candidate_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings
    WHERE job_postings.id = candidate_applications.job_posting_id
    AND job_postings.recruiter_id IN (
      SELECT id FROM public.recruiters
      WHERE user_id = auth.uid()
    )
  )
);

-- Create policies for job_postings
CREATE POLICY "Anyone can view active job postings"
ON public.job_postings
FOR SELECT
USING (status = 'active');

CREATE POLICY "Recruiters can manage their own job postings"
ON public.job_postings
FOR ALL
USING (
  recruiter_id IN (
    SELECT id FROM public.recruiters
    WHERE user_id = auth.uid()
  )
);

-- Create policies for users
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id); 