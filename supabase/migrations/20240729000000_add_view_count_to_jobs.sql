-- Add view_count to job_postings table
ALTER TABLE public.job_postings
ADD COLUMN view_count INT NOT NULL DEFAULT 0;

-- Create a function to increment the view count
CREATE OR REPLACE FUNCTION increment_job_view(job_id_param BIGINT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.job_postings
  SET view_count = view_count + 1
  WHERE id = job_id_param;
END;
$$;
