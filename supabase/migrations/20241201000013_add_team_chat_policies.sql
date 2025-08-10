-- Enable RLS and add robust team chat policies allowing team members to create conversations

-- Ensure RLS is enabled where missing
ALTER TABLE IF EXISTS public.team_conversation_members ENABLE ROW LEVEL SECURITY;

-- Team conversations: allow team members (not only owners) to create conversations for their team
DROP POLICY IF EXISTS "Team members can create conversations for their team" ON public.team_conversations;
CREATE POLICY "Team members can create conversations for their team"
ON public.team_conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.recruiter_id = team_conversations.recruiter_id
      AND tm.user_id = auth.uid()
      AND tm.status = 'active'
  )
);

-- Team conversation members policies
DROP POLICY IF EXISTS "Members can view conversation members" ON public.team_conversation_members;
CREATE POLICY "Members can view conversation members"
ON public.team_conversation_members
FOR SELECT
USING (
  -- You are the member row or you are a member of the same conversation
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.team_conversation_members tcm
    WHERE tcm.conversation_id = team_conversation_members.conversation_id
      AND tcm.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Members can add participants to their conversations" ON public.team_conversation_members;
CREATE POLICY "Members can add participants to their conversations"
ON public.team_conversation_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_conversation_members tcm
    WHERE tcm.conversation_id = team_conversation_members.conversation_id
      AND tcm.user_id = auth.uid()
  )
);

-- Optionally allow members to remove participants they can view (tighten later as needed)
DROP POLICY IF EXISTS "Members can remove participants from their conversations" ON public.team_conversation_members;
CREATE POLICY "Members can remove participants from their conversations"
ON public.team_conversation_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.team_conversation_members tcm
    WHERE tcm.conversation_id = team_conversation_members.conversation_id
      AND tcm.user_id = auth.uid()
  )
);

-- Team messages: tighten insert to require membership
DROP POLICY IF EXISTS "Team members can send messages" ON public.team_messages;
CREATE POLICY "Team members can send messages"
ON public.team_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.team_conversation_members tcm
    WHERE tcm.conversation_id = team_messages.conversation_id
      AND tcm.user_id = auth.uid()
  )
);


