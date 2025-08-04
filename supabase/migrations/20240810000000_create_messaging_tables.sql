-- Create conversations table
CREATE TABLE public.conversations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
    CONSTRAINT conversations_application_id_key UNIQUE (application_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    is_read boolean NOT NULL DEFAULT false,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp on conversation
CREATE OR REPLACE FUNCTION public.update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   UPDATE public.conversations
   SET updated_at = now()
   WHERE id = NEW.conversation_id;
   
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on new message
CREATE TRIGGER on_new_message_update_conversation_timestamp
  AFTER INSERT
  ON public.messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_conversation_updated_at();

-- RLS Policies for conversations
CREATE POLICY "Recruiters and candidates can view their conversations."
ON public.conversations
FOR SELECT
USING (
  (
    -- The user is the candidate
    auth.uid() IN (
      SELECT user_id FROM public.candidate_applications WHERE id = application_id
    ) OR
    -- The user is the recruiter who owns the job
    auth.uid() IN (
      SELECT r.user_id 
      FROM public.job_postings jp
      JOIN public.recruiters r ON jp.recruiter_id = r.id
      JOIN public.candidate_applications ca ON jp.id = ca.job_posting_id
      WHERE ca.id = application_id
    )
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations."
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.conversations
  )
);

CREATE POLICY "Users can insert messages in their conversations."
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM public.conversations
  )
); 