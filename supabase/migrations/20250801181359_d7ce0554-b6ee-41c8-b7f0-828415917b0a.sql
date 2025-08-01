-- Add missing columns to citation_checks table
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS competitor_analysis JSONB;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS total_sources INTEGER;