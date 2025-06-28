-- Function to send job posted notification
CREATE OR REPLACE FUNCTION send_job_posted_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- This will be handled by the application layer
    -- The trigger just logs the event for processing
    INSERT INTO email_logs (type, recipient_email, related_id, status)
    SELECT 
        'job_posted',
        u.email,
        NEW.id,
        'pending'
    FROM users u
    WHERE u.id = NEW.recruiter_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send application alert
CREATE OR REPLACE FUNCTION send_application_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the application alert for processing
    INSERT INTO email_logs (type, recipient_email, related_id, status)
    SELECT 
        'application_alert',
        u.email,
        NEW.id,
        'pending'
    FROM users u
    JOIN job_postings jp ON jp.id = NEW.job_posting_id
    WHERE u.id = jp.recruiter_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check for expiring jobs (runs daily)
CREATE OR REPLACE FUNCTION check_expiring_jobs()
RETURNS void AS $$
BEGIN
    -- Insert reminders for jobs expiring in 7 days
    INSERT INTO email_logs (type, recipient_email, related_id, status)
    SELECT 
        'job_expiry_reminder_7',
        u.email,
        jp.id,
        'pending'
    FROM job_postings jp
    JOIN users u ON u.id = jp.recruiter_id
    WHERE jp.is_active = true 
    AND jp.created_at + INTERVAL '30 days' = CURRENT_DATE + INTERVAL '7 days'
    AND NOT EXISTS (
        SELECT 1 FROM email_logs el 
        WHERE el.type = 'job_expiry_reminder_7' 
        AND el.related_id = jp.id
        AND el.sent_at > CURRENT_DATE - INTERVAL '1 day'
    );
    
    -- Insert reminders for jobs expiring in 1 day
    INSERT INTO email_logs (type, recipient_email, related_id, status)
    SELECT 
        'job_expiry_reminder_1',
        u.email,
        jp.id,
        'pending'
    FROM job_postings jp
    JOIN users u ON u.id = jp.recruiter_id
    WHERE jp.is_active = true 
    AND jp.created_at + INTERVAL '30 days' = CURRENT_DATE + INTERVAL '1 day'
    AND NOT EXISTS (
        SELECT 1 FROM email_logs el 
        WHERE el.type = 'job_expiry_reminder_1' 
        AND el.related_id = jp.id
        AND el.sent_at > CURRENT_DATE - INTERVAL '1 day'
    );
    
    -- Mark expired jobs and send notifications
    UPDATE job_postings 
    SET is_active = false 
    WHERE is_active = true 
    AND created_at + INTERVAL '30 days' < CURRENT_DATE;
    
    -- Send expired notifications
    INSERT INTO email_logs (type, recipient_email, related_id, status)
    SELECT 
        'job_expired',
        u.email,
        jp.id,
        'pending'
    FROM job_postings jp
    JOIN users u ON u.id = jp.recruiter_id
    WHERE jp.is_active = false 
    AND jp.created_at + INTERVAL '30 days' < CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM email_logs el 
        WHERE el.type = 'job_expired' 
        AND el.related_id = jp.id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate weekly reports
CREATE OR REPLACE FUNCTION generate_weekly_reports()
RETURNS void AS $$
DECLARE
    recruiter_record RECORD;
    total_applications INTEGER;
    new_applications INTEGER;
    active_jobs INTEGER;
    expiring_jobs INTEGER;
BEGIN
    -- Loop through all recruiters
    FOR recruiter_record IN 
        SELECT DISTINCT r.user_id, u.email
        FROM recruiters r
        JOIN users u ON u.id = r.user_id
        JOIN recruiter_notifications rn ON rn.recruiter_id = r.user_id
        WHERE rn.weekly_reports = true
    LOOP
        -- Calculate statistics for this recruiter
        SELECT 
            COUNT(DISTINCT ca.id),
            COUNT(DISTINCT CASE WHEN ca.created_at > CURRENT_DATE - INTERVAL '7 days' THEN ca.id END),
            COUNT(DISTINCT CASE WHEN jp.is_active = true THEN jp.id END),
            COUNT(DISTINCT CASE WHEN jp.is_active = true AND jp.created_at + INTERVAL '30 days' < CURRENT_DATE + INTERVAL '7 days' THEN jp.id END)
        INTO total_applications, new_applications, active_jobs, expiring_jobs
        FROM job_postings jp
        LEFT JOIN candidate_applications ca ON ca.job_posting_id = jp.id
        WHERE jp.recruiter_id = recruiter_record.user_id;
        
        -- Only send report if there's activity
        IF total_applications > 0 OR active_jobs > 0 THEN
            INSERT INTO email_logs (type, recipient_email, related_id, status)
            VALUES (
                'weekly_report',
                recruiter_record.email,
                NULL,
                'pending'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER job_posted_notification_trigger
    AFTER INSERT ON job_postings
    FOR EACH ROW
    EXECUTE FUNCTION send_job_posted_notification();

CREATE TRIGGER application_alert_trigger
    AFTER INSERT ON candidate_applications
    FOR EACH ROW
    EXECUTE FUNCTION send_application_alert();

-- Create a scheduled job to check expiring jobs daily
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('check-expiring-jobs', '0 9 * * *', 'SELECT check_expiring_jobs();');

-- Create a scheduled job to generate weekly reports on Mondays
-- SELECT cron.schedule('generate-weekly-reports', '0 10 * * 1', 'SELECT generate_weekly_reports();'); 