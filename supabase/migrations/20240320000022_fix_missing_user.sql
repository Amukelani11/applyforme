-- Fix missing user in users table
-- This migration ensures the user exists in the public.users table

INSERT INTO public.users (id, email, full_name, subscription_status, trial_end, created_at, updated_at)
VALUES (
  '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf',
  'user@example.com',
  'Test User',
  'trial',
  (now() + interval '14 days'),
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Also ensure the trigger is working properly
-- Drop and recreate the trigger to make sure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 