-- Ensure user_improvement_limits table exists with correct schema
CREATE TABLE IF NOT EXISTS public.user_improvement_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  plan_type text NOT NULL DEFAULT 'free'::text,
  improvements_this_month integer NULL DEFAULT 0,
  last_improvement_date timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_improvement_limits_pkey PRIMARY KEY (id),
  CONSTRAINT user_improvement_limits_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON user_improvement_limits;
CREATE TRIGGER set_updated_at 
  BEFORE UPDATE ON user_improvement_limits 
  FOR EACH ROW 
  EXECUTE FUNCTION set_updated_at();

-- Ensure RLS policies exist
ALTER TABLE public.user_improvement_limits ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own improvement limits
DROP POLICY IF EXISTS "Users can view their own improvement limits" ON public.user_improvement_limits;
CREATE POLICY "Users can view their own improvement limits"
    ON public.user_improvement_limits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to insert their own improvement limits
DROP POLICY IF EXISTS "Users can insert their own improvement limits" ON public.user_improvement_limits;
CREATE POLICY "Users can insert their own improvement limits"
    ON public.user_improvement_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own improvement limits
DROP POLICY IF EXISTS "Users can update their own improvement limits" ON public.user_improvement_limits;
CREATE POLICY "Users can update their own improvement limits"
    ON public.user_improvement_limits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_improvement_limits_user_id ON public.user_improvement_limits(user_id);

-- Add unique constraint to ensure one record per user
DROP INDEX IF EXISTS idx_user_improvement_limits_user_id_unique;
CREATE UNIQUE INDEX idx_user_improvement_limits_user_id_unique ON public.user_improvement_limits(user_id); 