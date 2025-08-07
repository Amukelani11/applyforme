-- Create enterprise_contacts table
CREATE TABLE IF NOT EXISTS enterprise_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  monthly_jobs TEXT NOT NULL,
  team_size TEXT NOT NULL,
  current_tools TEXT,
  requirements TEXT,
  timeline TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enterprise_contacts_status ON enterprise_contacts(status);
CREATE INDEX IF NOT EXISTS idx_enterprise_contacts_created_at ON enterprise_contacts(created_at);

-- Enable RLS
ALTER TABLE enterprise_contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage enterprise contacts" ON enterprise_contacts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_enterprise_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_enterprise_contacts_updated_at
  BEFORE UPDATE ON enterprise_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_enterprise_contacts_updated_at(); 