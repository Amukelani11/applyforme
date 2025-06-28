-- Create cv_improvements table
CREATE TABLE IF NOT EXISTS public.cv_improvements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_cv_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
    improved_cv_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    issues_found JSONB,
    improvements_made JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_improvement_limits table
CREATE TABLE IF NOT EXISTS public.user_improvement_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free',
    improvements_this_month INTEGER DEFAULT 0,
    last_improvement_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.cv_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_improvement_limits ENABLE ROW LEVEL SECURITY;

-- CV improvements policies
CREATE POLICY "Users can view their own cv improvements"
    ON public.cv_improvements
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cv improvements"
    ON public.cv_improvements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cv improvements"
    ON public.cv_improvements
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cv improvements"
    ON public.cv_improvements
    FOR DELETE
    USING (auth.uid() = user_id);

-- User improvement limits policies
CREATE POLICY "Users can view their own improvement limits"
    ON public.user_improvement_limits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own improvement limits"
    ON public.user_improvement_limits
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.cv_improvements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.user_improvement_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 