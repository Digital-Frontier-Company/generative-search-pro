
-- Add hero_answer column to content_blocks table
ALTER TABLE content_blocks ADD COLUMN IF NOT EXISTS hero_answer TEXT;

-- Comment on the new column
COMMENT ON COLUMN content_blocks.hero_answer IS 'Short answer to the main topic question';
