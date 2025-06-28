-- Create recruiter_notifications table
CREATE TABLE IF NOT EXISTS public.recruiter_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    application_alerts BOOLEAN DEFAULT true,
    job_expiry_reminders BOOLEAN DEFAULT true,
    weekly_reports BOOLEAN DEFAULT false,
    marketing_emails BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.recruiter_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own notification settings
CREATE POLICY "Users can view own notification settings" ON public.recruiter_notifications
    FOR SELECT USING (auth.uid() = recruiter_id);

CREATE POLICY "Users can insert own notification settings" ON public.recruiter_notifications
    FOR INSERT WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Users can update own notification settings" ON public.recruiter_notifications
    FOR UPDATE USING (auth.uid() = recruiter_id);

CREATE POLICY "Users can delete own notification settings" ON public.recruiter_notifications
    FOR DELETE USING (auth.uid() = recruiter_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_recruiter_notifications_recruiter_id ON public.recruiter_notifications(recruiter_id);

-- Add trigger for updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.recruiter_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 