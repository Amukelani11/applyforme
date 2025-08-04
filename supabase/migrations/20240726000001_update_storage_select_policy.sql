-- Alter the existing storage policy to allow admins to view all documents,
-- in addition to users viewing their own.
ALTER POLICY "Users can view their own documents"
ON storage.objects
USING (
  (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
  OR
  (bucket_id = 'documents' AND public.is_admin(auth.uid()))
); 