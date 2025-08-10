-- Normalize INSERT policy on team_conversations to allow owners and active team members

ALTER TABLE IF EXISTS public.team_conversations ENABLE ROW LEVEL SECURITY;

-- Drop older INSERT policies to prevent ambiguity
DROP POLICY IF EXISTS "Recruiters can create conversations" ON public.team_conversations;
DROP POLICY IF EXISTS "Team members can create conversations for their team" ON public.team_conversations;

-- Combined owner/team-member INSERT policy
CREATE POLICY "Owners or team members can create conversations"
ON public.team_conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.recruiters r
    WHERE r.id = team_conversations.recruiter_id
      AND r.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = team_conversations.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);


