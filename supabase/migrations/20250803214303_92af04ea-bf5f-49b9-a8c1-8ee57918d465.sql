-- Fix ai_platform_citations table schema to match edge function data
ALTER TABLE public.ai_platform_citations 
  DROP COLUMN IF EXISTS total_results,
  DROP COLUMN IF EXISTS citation_found,
  DROP COLUMN IF EXISTS citation_position,
  DROP COLUMN IF EXISTS citation_snippet;

ALTER TABLE public.ai_platform_citations 
  ADD COLUMN results JSONB,
  ADD COLUMN total_citations INTEGER DEFAULT 0,
  ADD COLUMN average_score DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN average_confidence DECIMAL(5,2) DEFAULT 0;