-- Drop the redundant company column
ALTER TABLE public.work_experience DROP COLUMN IF EXISTS company;

-- Ensure company_name is properly set up
ALTER TABLE public.work_experience 
  ALTER COLUMN company_name SET NOT NULL;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id 
  ON public.work_experience(user_id);

-- Ensure RLS policies are in place
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own work experience" ON public.work_experience;
DROP POLICY IF EXISTS "Users can insert their own work experience" ON public.work_experience;
DROP POLICY IF EXISTS "Users can update their own work experience" ON public.work_experience;
DROP POLICY IF EXISTS "Users can delete their own work experience" ON public.work_experience;

CREATE POLICY "Users can view their own work experience"
  ON public.work_experience
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work experience"
  ON public.work_experience
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experience"
  ON public.work_experience
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experience"
  ON public.work_experience
  FOR DELETE
  USING (auth.uid() = user_id); 