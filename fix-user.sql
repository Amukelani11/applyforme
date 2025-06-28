-- Fix missing user in users table
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

-- Verify the user was created
SELECT * FROM public.users WHERE id = '683fce0d-2ce0-41de-a684-1e9ddf6ee1cf'; 