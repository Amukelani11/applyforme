-- Team member RLS policies to allow access to owner recruiter resources

-- Drop existing policies to avoid duplicate_object errors
DROP POLICY IF EXISTS "Team members can view team recruiter profile" ON public.recruiters;
DROP POLICY IF EXISTS "Team members can view team job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can view team applications" ON public.candidate_applications;

-- Allow team members to SELECT the recruiter profile for their team
CREATE POLICY "Team members can view team recruiter profile"
ON public.recruiters
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiters.id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

-- Allow team members to SELECT job postings of their team recruiter
CREATE POLICY "Team members can view team job postings"
ON public.job_postings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.job_postings.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

-- Allow team members to SELECT candidate applications for their team's jobs
CREATE POLICY "Team members can view team applications"
ON public.candidate_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.job_postings jp
    JOIN public.team_members tm ON tm.recruiter_id = jp.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active'
    WHERE jp.id = public.candidate_applications.job_posting_id
  )
);


