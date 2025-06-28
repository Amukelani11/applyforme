-- Add a UNIQUE constraint to the recruiter_id column in the recruiter_subscriptions table.
-- This ensures a recruiter can only have one subscription record, making the 'upsert' operation in the webhook possible.
ALTER TABLE public.recruiter_subscriptions
ADD CONSTRAINT recruiter_subscriptions_recruiter_id_key UNIQUE (recruiter_id); 