-- Supabase SQL Setup for Countries Favourites Feature
-- Run these commands in your Supabase SQL Editor

-- 1. Create favourites table
CREATE TABLE IF NOT EXISTS favourites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_name TEXT NOT NULL,
  country_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one favourite per user per country
  UNIQUE(user_id, country_name)
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Create trigger for updated_at
CREATE TRIGGER update_favourites_updated_at 
    BEFORE UPDATE ON favourites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own favourites" ON favourites;
DROP POLICY IF EXISTS "Users can insert own favourites" ON favourites;
DROP POLICY IF EXISTS "Users can update own favourites" ON favourites;
DROP POLICY IF EXISTS "Users can delete own favourites" ON favourites;

-- Policy: Users can only see their own favourites
CREATE POLICY "Users can view own favourites" ON favourites
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own favourites
CREATE POLICY "Users can insert own favourites" ON favourites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own favourites
CREATE POLICY "Users can update own favourites" ON favourites
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own favourites
CREATE POLICY "Users can delete own favourites" ON favourites
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS favourites_user_id_idx ON favourites(user_id);
CREATE INDEX IF NOT EXISTS favourites_country_name_idx ON favourites(country_name);

-- 7. Grant necessary permissions (if needed)
-- GRANT ALL ON favourites TO authenticated;
-- GRANT ALL ON favourites TO service_role;
