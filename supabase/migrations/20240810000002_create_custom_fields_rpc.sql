-- Create RPC function to handle custom field responses
CREATE OR REPLACE FUNCTION insert_custom_field_responses(
  p_application_id UUID,
  p_custom_fields JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  field_record RECORD;
  field_value TEXT;
  file_url TEXT;
BEGIN
  -- Loop through each custom field in the JSONB object
  FOR field_record IN 
    SELECT * FROM jsonb_each(p_custom_fields)
  LOOP
    -- Extract field value
    field_value := field_record.value::TEXT;
    
    -- Remove quotes from the value if it's a string
    IF field_value LIKE '"%"' THEN
      field_value := substring(field_value from 2 for length(field_value) - 2);
    END IF;
    
    -- Insert the custom field response
    INSERT INTO custom_field_responses (
      application_id,
      field_id,
      field_value,
      file_url
    )
    SELECT 
      p_application_id,
      jcf.id,
      field_value,
      CASE 
        WHEN jcf.field_type = 'file' THEN field_value
        ELSE NULL
      END
    FROM job_custom_fields jcf
    WHERE jcf.field_name = field_record.key
    AND jcf.job_posting_id = (
      SELECT job_id FROM public_applications WHERE id = p_application_id
    );
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION insert_custom_field_responses(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_custom_field_responses(UUID, JSONB) TO anon; 