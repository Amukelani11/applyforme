-- Create or replace the is_admin function to ensure it exists and is up-to-date.
-- This version takes a user_id parameter for flexibility
CREATE OR REPLACE FUNCTION public.is_admin(user_id_to_check uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS
$func$
DECLARE
  is_admin_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id_to_check AND is_admin = true
  ) INTO is_admin_user;

  RETURN is_admin_user;
END;
$func$;

-- Also ensure the parameterless version exists for backward compatibility
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT is_admin FROM public.users WHERE id = auth.uid();
$$;

-- Grant execute permissions on the functions to the authenticated role.
-- This is crucial for RLS policies to be able to use the functions.
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Drop the policy if it exists to ensure the script is re-runnable.
DROP POLICY IF EXISTS "Allow admins to read all job preferences" ON public.job_preferences;

-- Create the policy that allows admins to read all job preferences.
CREATE POLICY "Allow admins to read all job preferences"
ON public.job_preferences FOR SELECT
USING (public.is_admin(auth.uid())); 