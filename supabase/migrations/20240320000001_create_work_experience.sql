-- Create work_experience table
CREATE TABLE IF NOT EXISTS public.work_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current_job BOOLEAN DEFAULT false,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own work experience"
    ON public.work_experience
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own work experience"
    ON public.work_experience
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experience"
    ON public.work_experience
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experience"
    ON public.work_experience
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.work_experience
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 