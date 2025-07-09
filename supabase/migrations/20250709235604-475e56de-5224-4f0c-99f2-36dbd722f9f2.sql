
-- Add columns to seo_analyses table for dashboard content and caching
ALTER TABLE seo_analyses 
ADD COLUMN dashboard_content TEXT,
ADD COLUMN dashboard_generated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN cache_key TEXT;

-- Create index on cache_key for faster lookups
CREATE INDEX idx_seo_analyses_cache_key ON seo_analyses(cache_key);

-- Create index on dashboard_generated_at for performance
CREATE INDEX idx_seo_analyses_dashboard_generated_at ON seo_analyses(dashboard_generated_at);
