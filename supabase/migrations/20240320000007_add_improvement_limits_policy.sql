-- Add missing INSERT policy for user_improvement_limits
CREATE POLICY "Users can insert their own improvement limits"
    ON public.user_improvement_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id); 