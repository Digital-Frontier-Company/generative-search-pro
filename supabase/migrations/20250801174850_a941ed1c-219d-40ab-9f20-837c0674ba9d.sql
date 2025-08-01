-- Fix citation_checks table schema
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS citation_position INTEGER;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS confidence_score DECIMAL;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS query_complexity TEXT;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS competitors_found JSONB;
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS improvement_areas JSONB;