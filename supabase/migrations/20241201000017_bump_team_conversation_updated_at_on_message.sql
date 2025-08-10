-- Ensure updated_at on team_conversations reflects newest message time

CREATE OR REPLACE FUNCTION public.update_team_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.team_conversations
     SET updated_at = NEW.created_at
   WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_new_team_message_update_conversation ON public.team_messages;
CREATE TRIGGER on_new_team_message_update_conversation
AFTER INSERT ON public.team_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_team_conversation_timestamp();


