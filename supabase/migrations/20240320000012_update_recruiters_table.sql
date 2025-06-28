-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Recruiters can view own profile" ON public.recruiters;
DROP POLICY IF EXISTS "Recruiters can update own profile" ON public.recruiters;

-- Add is_recruiter column to users table if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_recruiter BOOLEAN DEFAULT false;

-- Add new columns to recruiters table
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_phone TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Enable RLS
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Recruiters can view own profile"
ON public.recruiters
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Recruiters can update own profile"
ON public.recruiters
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow recruiters to insert their own profile
CREATE POLICY "Recruiters can insert own profile"
ON public.recruiters
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all recruiter profiles
CREATE POLICY "Admins can manage all recruiter profiles"
ON public.recruiters
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
); 