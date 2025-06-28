-- Creates a trigger function that sets the updated_at column to the current timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: You can apply this trigger to any table with an `updated_at` column like this:
-- CREATE TRIGGER set_updated_at
-- BEFORE UPDATE ON your_table_name
-- FOR EACH ROW
-- EXECUTE FUNCTION public.trigger_set_updated_at(); 