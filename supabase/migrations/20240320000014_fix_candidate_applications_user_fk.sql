-- Drop existing user_id FK on candidate_applications if it references auth.users
ALTER TABLE public.candidate_applications
DROP CONSTRAINT IF EXISTS candidate_applications_user_id_fkey;

-- Add new FK pointing to public.users (so we can embed users in PostgREST)
ALTER TABLE public.candidate_applications
ADD CONSTRAINT candidate_applications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Ensure RLS policies still work
-- No change needed since policies rely on auth.uid() = user_id which matches public.users(id) as well. 