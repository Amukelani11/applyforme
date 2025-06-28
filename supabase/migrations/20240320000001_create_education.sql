-- Create education table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current_education BOOLEAN DEFAULT false,
    description TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own education"
    ON public.education
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education"
    ON public.education
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
    ON public.education
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
    ON public.education
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.education
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 