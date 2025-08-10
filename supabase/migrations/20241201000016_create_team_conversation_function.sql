-- Create a SECURITY DEFINER function to create a team conversation securely

CREATE OR REPLACE FUNCTION public.create_team_conversation(
  _participants uuid[],
  _name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recruiter_id uuid;
  v_conv_id uuid;
  v_uid uuid := auth.uid();
  v_participant uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Resolve recruiter context: owner first, then team membership (active)
  SELECT id INTO v_recruiter_id
  FROM public.recruiters
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_recruiter_id IS NULL THEN
    SELECT recruiter_id INTO v_recruiter_id
    FROM public.team_members
    WHERE user_id = v_uid
      AND status = 'active'
    LIMIT 1;
  END IF;

  IF v_recruiter_id IS NULL THEN
    RAISE EXCEPTION 'Recruiter context not found';
  END IF;

  -- Create conversation
  INSERT INTO public.team_conversations (recruiter_id, conversation_name)
  VALUES (v_recruiter_id, _name)
  RETURNING id INTO v_conv_id;

  -- Add creator as member
  INSERT INTO public.team_conversation_members (conversation_id, user_id)
  VALUES (v_conv_id, v_uid)
  ON CONFLICT DO NOTHING;

  -- Add other participants (unique, exclude creator/null)
  IF _participants IS NOT NULL THEN
    FOREACH v_participant IN ARRAY _participants LOOP
      IF v_participant IS NOT NULL AND v_participant <> v_uid THEN
        INSERT INTO public.team_conversation_members (conversation_id, user_id)
        VALUES (v_conv_id, v_participant)
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN v_conv_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_team_conversation(uuid[], text) TO authenticated;


