-- Add payfast_token to recruiter_subscriptions for recurring billing
ALTER TABLE public.recruiter_subscriptions
ADD COLUMN IF NOT EXISTS payfast_token TEXT,
ADD COLUMN IF NOT EXISTS payfast_subscription_id TEXT; -- To store the subscription ID from PayFast if available

-- Add an index for the token
CREATE INDEX IF NOT EXISTS idx_recruiter_subscriptions_payfast_token ON public.recruiter_subscriptions(payfast_token); 