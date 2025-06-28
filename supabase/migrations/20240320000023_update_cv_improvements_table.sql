-- Update cv_improvements table to add admin_notes field and fix id type
-- First, drop existing table if it exists
DROP TABLE IF EXISTS public.cv_improvements CASCADE;

-- Recreate cv_improvements table with correct structure
CREATE TABLE IF NOT EXISTS public.cv_improvements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_cv_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
    improved_cv_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    issues_found JSONB,
    improvements_made JSONB,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.cv_improvements ENABLE ROW LEVEL SECURITY;

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

-- Admin policies for cv_improvements
CREATE POLICY "Admins can view all cv improvements"
    ON public.cv_improvements
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can update all cv improvements"
    ON public.cv_improvements
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.cv_improvements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at(); 