-- Role-based access policies for recruiter team roles

-- Helpers: ensure tables have RLS enabled (no-op if already enabled)
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiter_events ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive policies that might conflict (idempotent)
DROP POLICY IF EXISTS "Team members can manage job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can insert job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can update job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can delete job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can update applications" ON public.candidate_applications;
DROP POLICY IF EXISTS "Team members can view applications" ON public.candidate_applications;
DROP POLICY IF EXISTS "Recruiter owner can manage job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Team members can view subscriptions" ON public.recruiter_subscriptions;
DROP POLICY IF EXISTS "Team admin can manage subscriptions" ON public.recruiter_subscriptions;
DROP POLICY IF EXISTS "Team admin can update subscriptions" ON public.recruiter_subscriptions;
DROP POLICY IF EXISTS "Team admin can delete subscriptions" ON public.recruiter_subscriptions;

-- VIEW policies (read) for applications already added previously; ensure present
CREATE POLICY "Team members can view applications"
ON public.candidate_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.job_postings jp
    JOIN public.team_members tm ON tm.recruiter_id = jp.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active'
    WHERE jp.id = public.candidate_applications.job_posting_id
  )
  OR EXISTS (
    SELECT 1 FROM public.job_postings jp
    JOIN public.recruiters r ON r.id = jp.recruiter_id AND r.user_id = auth.uid()
    WHERE jp.id = public.candidate_applications.job_posting_id
  )
);

-- WRITE policies for job_postings by owner recruiter and team roles (admin, recruiter)
CREATE POLICY "Recruiter owner can manage job postings"
ON public.job_postings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.job_postings.recruiter_id AND r.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.job_postings.recruiter_id AND r.user_id = auth.uid()
  )
);

-- INSERT
CREATE POLICY "Team members can insert job postings"
ON public.job_postings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.job_postings.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);

-- UPDATE
CREATE POLICY "Team members can update job postings"
ON public.job_postings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.job_postings.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.job_postings.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);

-- DELETE
CREATE POLICY "Team members can delete job postings"
ON public.job_postings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.job_postings.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);

-- WRITE policies for candidate_applications status updates (admin, recruiter)
CREATE POLICY "Team members can update applications"
ON public.candidate_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    JOIN public.team_members tm ON tm.recruiter_id = jp.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active' AND tm.role IN ('admin','recruiter')
    WHERE jp.id = public.candidate_applications.job_posting_id
  )
  OR EXISTS (
    SELECT 1 FROM public.job_postings jp
    JOIN public.recruiters r ON r.id = jp.recruiter_id AND r.user_id = auth.uid()
    WHERE jp.id = public.candidate_applications.job_posting_id
  )
);

-- Billing/subscriptions access
CREATE POLICY "Team members can view subscriptions"
ON public.recruiter_subscriptions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.recruiter_subscriptions.recruiter_id AND r.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_subscriptions.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active'
  )
);

CREATE POLICY "Team admin can update subscriptions"
ON public.recruiter_subscriptions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_subscriptions.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active' AND tm.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.recruiter_subscriptions.recruiter_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Team admin can delete subscriptions"
ON public.recruiter_subscriptions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_subscriptions.recruiter_id AND tm.user_id = auth.uid() AND tm.status = 'active' AND tm.role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.recruiter_subscriptions.recruiter_id AND r.user_id = auth.uid()
  )
);


