-- Step 1: Delete any recruiter profiles that do not have an associated user.
-- This is necessary to enforce the new UNIQUE constraint.
DELETE FROM public.recruiters WHERE user_id IS NULL;

-- Step 2: Add a UNIQUE constraint to the user_id column.
-- This enforces a one-to-one relationship between a user and a recruiter profile.
ALTER TABLE public.recruiters
ADD CONSTRAINT recruiters_user_id_unique UNIQUE (user_id);

-- Step 3: We can also make the user_id column NOT NULL now.
-- This further strengthens data integrity.
ALTER TABLE public.recruiters
ALTER COLUMN user_id SET NOT NULL; 