-- First create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add missing columns to seo_analyses table
ALTER TABLE public.seo_analyses 
ADD COLUMN IF NOT EXISTS schema_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS meta_description JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS heading_structure JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_optimization_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accessibility_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS competitor_comparison JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]';

-- Create ai_platform_citations table
CREATE TABLE IF NOT EXISTS public.ai_platform_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  domain TEXT NOT NULL,
  platforms JSONB DEFAULT '[]',
  search_method TEXT DEFAULT 'automated',
  total_results INTEGER DEFAULT 0,
  citation_found BOOLEAN DEFAULT false,
  citation_position INTEGER,
  citation_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ai_platform_citations
ALTER TABLE public.ai_platform_citations ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_platform_citations
CREATE POLICY "Users can view their own platform citations" 
ON public.ai_platform_citations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform citations" 
ON public.ai_platform_citations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform citations" 
ON public.ai_platform_citations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform citations" 
ON public.ai_platform_citations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create competitor_analyses table
CREATE TABLE IF NOT EXISTS public.competitor_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_domain TEXT NOT NULL,
  competitor_domains JSONB DEFAULT '[]',
  analysis_queries JSONB DEFAULT '[]',
  competitor_analyses JSONB DEFAULT '{}',
  gap_opportunities JSONB DEFAULT '[]',
  content_gaps JSONB DEFAULT '[]',
  keyword_gaps JSONB DEFAULT '[]',
  backlink_gaps JSONB DEFAULT '[]',
  performance_comparison JSONB DEFAULT '{}',
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on competitor_analyses
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for competitor_analyses
CREATE POLICY "Users can view their own competitor analyses" 
ON public.competitor_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitor analyses" 
ON public.competitor_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitor analyses" 
ON public.competitor_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitor analyses" 
ON public.competitor_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create opportunity_scans table
CREATE TABLE IF NOT EXISTS public.opportunity_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  opportunities JSONB DEFAULT '[]',
  total_opportunities INTEGER DEFAULT 0,
  high_potential_count INTEGER DEFAULT 0,
  medium_potential_count INTEGER DEFAULT 0,
  low_potential_count INTEGER DEFAULT 0,
  scan_type TEXT DEFAULT 'comprehensive',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on opportunity_scans
ALTER TABLE public.opportunity_scans ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunity_scans
CREATE POLICY "Users can view their own opportunity scans" 
ON public.opportunity_scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opportunity scans" 
ON public.opportunity_scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunity scans" 
ON public.opportunity_scans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunity scans" 
ON public.opportunity_scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create voice_citations table
CREATE TABLE IF NOT EXISTS public.voice_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  domain TEXT NOT NULL,
  assistant_platform TEXT NOT NULL,
  response_text TEXT,
  is_cited BOOLEAN DEFAULT false,
  citation_position INTEGER,
  citation_context TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on voice_citations
ALTER TABLE public.voice_citations ENABLE ROW LEVEL SECURITY;

-- Create policies for voice_citations
CREATE POLICY "Users can view their own voice citations" 
ON public.voice_citations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice citations" 
ON public.voice_citations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice citations" 
ON public.voice_citations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice citations" 
ON public.voice_citations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at triggers for new tables
CREATE TRIGGER update_ai_platform_citations_updated_at
  BEFORE UPDATE ON public.ai_platform_citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_competitor_analyses_updated_at
  BEFORE UPDATE ON public.competitor_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunity_scans_updated_at
  BEFORE UPDATE ON public.opportunity_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_voice_citations_updated_at
  BEFORE UPDATE ON public.voice_citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();