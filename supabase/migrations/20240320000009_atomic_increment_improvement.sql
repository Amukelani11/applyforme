-- Atomic increment function for user improvements
CREATE OR REPLACE FUNCTION public.increment_improvements_if_allowed(user_id uuid, plan_limit integer)
RETURNS boolean AS $$
DECLARE
  updated boolean := false;
BEGIN
  UPDATE public.user_improvement_limits
  SET improvements_this_month = improvements_this_month + 1,
      last_improvement_date = timezone('utc'::text, now())
  WHERE user_id = increment_improvements_if_allowed.user_id
    AND improvements_this_month < plan_limit;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.increment_improvements_if_allowed(uuid, integer) TO authenticated; 