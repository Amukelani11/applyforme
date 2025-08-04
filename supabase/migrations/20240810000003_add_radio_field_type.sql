-- Add radio field type to the check constraint
ALTER TABLE public.job_custom_fields 
DROP CONSTRAINT IF EXISTS job_custom_fields_field_type_check;

ALTER TABLE public.job_custom_fields 
ADD CONSTRAINT job_custom_fields_field_type_check 
CHECK (field_type IN ('text', 'textarea', 'number', 'email', 'phone', 'date', 'select', 'radio', 'checkbox', 'file')); 