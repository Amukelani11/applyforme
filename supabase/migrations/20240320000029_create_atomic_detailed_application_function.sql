-- Create a function to atomically increment the public application count and insert a new detailed application
CREATE OR REPLACE FUNCTION increment_public_app_count_and_insert_detailed(
    p_job_id BIGINT,
    p_full_name TEXT,
    p_email TEXT,
    p_cv_path TEXT,
    p_phone_number TEXT,
    p_cover_letter TEXT,
    p_work_experience JSONB,
    p_education JSONB
)
RETURNS void AS $$
DECLARE
    current_count INT;
BEGIN
    -- Lock the job posting row to prevent race conditions
    SELECT public_application_count INTO current_count FROM public.job_postings WHERE id = p_job_id FOR UPDATE;

    IF current_count >= 5 THEN
        RAISE EXCEPTION 'Public application limit reached for job %', p_job_id;
    END IF;

    -- Update the count
    UPDATE public.job_postings
    SET public_application_count = public_application_count + 1
    WHERE id = p_job_id;

    -- Insert the new application
    INSERT INTO public.public_applications (job_id, full_name, email, cv_path, phone_number, cover_letter, work_experience, education)
    VALUES (p_job_id, p_full_name, p_email, p_cv_path, p_phone_number, p_cover_letter, p_work_experience, p_education);
END;
$$ LANGUAGE plpgsql; 