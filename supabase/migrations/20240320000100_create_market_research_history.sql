-- Create market research history table
CREATE TABLE IF NOT EXISTS market_research_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('quick', 'full')),
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_research_user_id ON market_research_history(user_id);
CREATE INDEX IF NOT EXISTS idx_market_research_created_at ON market_research_history(created_at);

-- Enable Row Level Security
ALTER TABLE market_research_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own research history" ON market_research_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research" ON market_research_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research" ON market_research_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research" ON market_research_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_market_research_history_updated_at 
  BEFORE UPDATE ON market_research_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 