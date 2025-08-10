-- Allow team members to view public applications for their team's jobs
DROP POLICY IF EXISTS "Team members can view public applications" ON public.public_applications;
CREATE POLICY "Team members can view public applications"
ON public.public_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    JOIN public.team_members tm 
      ON tm.recruiter_id = jp.recruiter_id 
     AND tm.user_id = auth.uid() 
     AND tm.status = 'active'
    WHERE jp.id = public.public_applications.job_id
  )
);

-- Relax recruiter_events policies to include team members
-- Existing owner policy might exist; create team policies alongside
DROP POLICY IF EXISTS "Team members can view team events" ON public.recruiter_events;
CREATE POLICY "Team members can view team events"
ON public.recruiter_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_events.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

DROP POLICY IF EXISTS "Team members can create events" ON public.recruiter_events;
CREATE POLICY "Team members can create events"
ON public.recruiter_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_events.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);

DROP POLICY IF EXISTS "Team members can update events" ON public.recruiter_events;
CREATE POLICY "Team members can update events"
ON public.recruiter_events
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_events.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_events.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);

DROP POLICY IF EXISTS "Team members can delete events" ON public.recruiter_events;
CREATE POLICY "Team members can delete events"
ON public.recruiter_events
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = public.recruiter_events.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.role IN ('admin','recruiter')
  )
);



