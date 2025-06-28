-- Add phone and address columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Update the handle_new_user function to include the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    subscription_status,
    trial_end,
    phone,
    address
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'trial',
    (now() + interval '14 days'),
    null,
    null
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 