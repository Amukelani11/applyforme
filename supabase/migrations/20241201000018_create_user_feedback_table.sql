-- User feedback table for contextual app feedback

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
  role TEXT,
  context TEXT NOT NULL, -- e.g., post_job, candidate_review, collaboration, sign_out, threshold
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow insert by authenticated users
DROP POLICY IF EXISTS "feedback_insert_authenticated" ON public.user_feedback;
CREATE POLICY "feedback_insert_authenticated"
ON public.user_feedback
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

-- Allow users to read their own feedback
DROP POLICY IF EXISTS "feedback_select_self" ON public.user_feedback;
CREATE POLICY "feedback_select_self"
ON public.user_feedback
FOR SELECT
USING (user_id = auth.uid());

-- Allow recruiter owners (by recruiter.user_id) to read feedback tied to their recruiter_id
DROP POLICY IF EXISTS "feedback_select_recruiter_owner" ON public.user_feedback;
CREATE POLICY "feedback_select_recruiter_owner"
ON public.user_feedback
FOR SELECT
USING (
  recruiter_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = public.user_feedback.recruiter_id
      AND r.user_id = auth.uid()
  )
);

-- Allow admins to read all feedback (assuming users.is_admin flag)
DROP POLICY IF EXISTS "feedback_select_admin" ON public.user_feedback;
CREATE POLICY "feedback_select_admin"
ON public.user_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND COALESCE(u.is_admin, false) = true
  )
);


