-- Create a table to log all incoming PayFast ITN requests
CREATE TABLE IF NOT EXISTS public.payfast_logs (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    pf_payment_id TEXT,
    payment_status TEXT,
    recruiter_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to atomically add job credits to a recruiter's account
CREATE OR REPLACE FUNCTION public.add_job_credits(
    p_recruiter_id UUID,
    p_credits_to_add INTEGER
)
RETURNS void AS $$
BEGIN
    UPDATE public.recruiters
    SET job_credits = job_credits + p_credits_to_add
    WHERE id = p_recruiter_id;
END;
$$ LANGUAGE plpgsql; 