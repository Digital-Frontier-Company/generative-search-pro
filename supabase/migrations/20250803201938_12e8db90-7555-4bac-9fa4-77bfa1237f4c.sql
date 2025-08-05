-- Add missing engine column to citation_checks table
ALTER TABLE citation_checks ADD COLUMN IF NOT EXISTS engine TEXT DEFAULT 'google';

-- Update any existing records to have the engine column set
UPDATE citation_checks SET engine = 'google' WHERE engine IS NULL;