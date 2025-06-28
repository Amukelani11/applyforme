-- Drop existing check constraint
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;

-- Add new check constraint with correct status values
ALTER TABLE public.applications ADD CONSTRAINT applications_status_check 
CHECK (status IN ('pending', 'reviewing', 'interviewed', 'accepted', 'rejected')); 