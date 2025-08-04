-- Alter the existing policy to allow admins to view all documents,
-- in addition to users viewing their own.
ALTER POLICY "Users can view their own documents"
ON public.documents
USING ((auth.uid() = user_id) OR (public.is_admin(auth.uid()))); 