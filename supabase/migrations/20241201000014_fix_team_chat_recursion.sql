-- Fix recursive RLS on team_conversation_members by using a SECURITY DEFINER helper

-- 1) Helper function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_team_conversation_member(conv_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.team_conversation_members tcm
    where tcm.conversation_id = conv_id
      and tcm.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_team_conversation_member(uuid) TO authenticated;

-- 2) Replace recursive policies with function-based policies
DROP POLICY IF EXISTS "Members can view conversation members" ON public.team_conversation_members;
DROP POLICY IF EXISTS "Members can add participants to their conversations" ON public.team_conversation_members;
DROP POLICY IF EXISTS "Members can remove participants from their conversations" ON public.team_conversation_members;

-- Allow members of a conversation (or selecting their own row) to view members
CREATE POLICY "Members can view conversation members v2"
ON public.team_conversation_members
FOR SELECT
USING (
  public.is_team_conversation_member(team_conversation_members.conversation_id)
  OR team_conversation_members.user_id = auth.uid()
);

-- Allow owners or active team members (same recruiter) to add participants, or existing members
CREATE POLICY "Members can add participants v2"
ON public.team_conversation_members
FOR INSERT
WITH CHECK (
  public.is_team_conversation_member(team_conversation_members.conversation_id)
  OR EXISTS (
    SELECT 1
    FROM public.team_conversations tc
    JOIN public.recruiters r ON r.id = tc.recruiter_id
    WHERE tc.id = team_conversation_members.conversation_id
      AND r.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.team_conversations tc
    JOIN public.team_members tm ON tm.recruiter_id = tc.recruiter_id AND tm.status = 'active'
    WHERE tc.id = team_conversation_members.conversation_id
      AND tm.user_id = auth.uid()
  )
);

-- Allow owners or active team members (same recruiter) or existing members to remove participants
CREATE POLICY "Members can remove participants v2"
ON public.team_conversation_members
FOR DELETE
USING (
  public.is_team_conversation_member(team_conversation_members.conversation_id)
  OR EXISTS (
    SELECT 1
    FROM public.team_conversations tc
    JOIN public.recruiters r ON r.id = tc.recruiter_id
    WHERE tc.id = team_conversation_members.conversation_id
      AND r.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM public.team_conversations tc
    JOIN public.team_members tm ON tm.recruiter_id = tc.recruiter_id AND tm.status = 'active'
    WHERE tc.id = team_conversation_members.conversation_id
      AND tm.user_id = auth.uid()
  )
);


