-- Add contract_term field to job_postings table
ALTER TABLE public.job_postings 
ADD COLUMN contract_term TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.job_postings.contract_term IS 'Contract duration/term (e.g., "3 months", "6 months", "1 year") for contract jobs'; 