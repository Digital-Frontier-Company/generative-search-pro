-- Remove unused foreign tables that are causing security warnings
-- These tables appear to be legacy/unused and are exposing API endpoints without RLS protection

DROP FOREIGN TABLE IF EXISTS public.contacts;
DROP FOREIGN TABLE IF EXISTS public.company;

-- Note: Remaining warnings require manual Supabase dashboard configuration:
-- 1. next_auth.uid function - cannot be modified (external extension)
-- 2. Extensions in public schema - move vector and postgres_fdw to extensions schema via dashboard
-- 3. MFA options - enable additional MFA methods in Auth settings

-- Add new columns to citation_checks table for enhanced features
ALTER TABLE citation_checks 
ADD COLUMN IF NOT EXISTS confidence_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS competitor_analysis JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS citation_position INTEGER,
ADD COLUMN IF NOT EXISTS total_sources INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS query_complexity TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS improvement_areas TEXT[] DEFAULT '{}';

-- Create citation_monitoring table for query monitoring
CREATE TABLE IF NOT EXISTS citation_monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    domain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    check_frequency TEXT DEFAULT 'daily', -- daily, weekly, monthly
    last_checked_at TIMESTAMP WITH TIME ZONE,
    last_citation_status BOOLEAN,
    alert_on_change BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_citation_monitoring_user_id ON citation_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_citation_monitoring_active ON citation_monitoring(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_citation_checks_confidence ON citation_checks(confidence_score);
CREATE INDEX IF NOT EXISTS idx_citation_checks_position ON citation_checks(citation_position);

-- Enable RLS on citation_monitoring
ALTER TABLE citation_monitoring ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for citation_monitoring
CREATE POLICY "Users can view own monitoring entries" ON citation_monitoring
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monitoring entries" ON citation_monitoring
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monitoring entries" ON citation_monitoring
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own monitoring entries" ON citation_monitoring
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for citation_monitoring
CREATE TRIGGER update_citation_monitoring_updated_at 
    BEFORE UPDATE ON citation_monitoring
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for citation analytics
CREATE OR REPLACE VIEW citation_analytics AS
SELECT 
    user_id,
    COUNT(*) as total_checks,
    COUNT(*) FILTER (WHERE is_cited = true) as successful_citations,
    ROUND(
        (COUNT(*) FILTER (WHERE is_cited = true)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as success_rate,
    AVG(confidence_score) as avg_confidence,
    COUNT(DISTINCT domain) as unique_domains,
    COUNT(DISTINCT query) as unique_queries,
    MAX(checked_at) as last_check_date,
    MIN(checked_at) as first_check_date
FROM citation_checks
GROUP BY user_id;