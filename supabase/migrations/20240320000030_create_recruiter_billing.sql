-- Add job_credits column to recruiters table
ALTER TABLE public.recruiters
ADD COLUMN IF NOT EXISTS job_credits INTEGER NOT NULL DEFAULT 0;

-- Create recruiter_subscriptions table to manage plans
CREATE TABLE IF NOT EXISTS public.recruiter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL, -- e.g., 'free', 'premium'
    status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set the updated_at timestamp automatically
CREATE TRIGGER set_recruiter_subscriptions_updated_at
BEFORE UPDATE ON public.recruiter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_updated_at();

-- Add RLS to the new table
ALTER TABLE public.recruiter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Recruiters can view their own subscriptions
CREATE POLICY "Recruiters can view their own subscriptions"
ON public.recruiter_subscriptions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.recruiters 
        WHERE public.recruiters.id = recruiter_id 
        AND public.recruiters.user_id = auth.uid()
    )
);

-- Add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recruiter_subscriptions_recruiter_id ON public.recruiter_subscriptions(recruiter_id); 