-- Fix the data type for recruiter_id in the RPC function from BIGINT to UUID
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
    v_recruiter_id UUID;  -- Fixed: Changed from BIGINT to UUID
    v_plan_id TEXT;
BEGIN
    -- Lock the job posting row and get count and recruiter_id
    SELECT public_application_count, recruiter_id 
    INTO current_count, v_recruiter_id 
    FROM public.job_postings 
    WHERE id = p_job_id FOR UPDATE;

    -- Check if recruiter is on a premium plan
    SELECT rs.plan_id 
    INTO v_plan_id
    FROM public.recruiter_subscriptions rs
    WHERE rs.recruiter_id = v_recruiter_id AND rs.status = 'active'
    LIMIT 1;

    -- Only check the limit if the user is not on a premium plan
    IF v_plan_id IS NULL OR v_plan_id != 'premium' THEN
        IF current_count >= 5 THEN
            RAISE EXCEPTION 'Public application limit reached for job %', p_job_id;
        END IF;
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