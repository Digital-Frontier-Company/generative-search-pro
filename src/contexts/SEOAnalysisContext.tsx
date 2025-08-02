import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface KeywordData {
  word: string;
  count: number;
  percentage: number;
}

interface SEOAnalysis {
  id?: number;
  domain?: string;
  total_score?: number;
  technical_score?: number;
  backlink_score?: number;
  performance_score?: number;
  analysis_data?: any;
  technical_findings?: any[];
  schema_count?: number;
  meta_description?: any;
  heading_structure?: any;
  ai_optimization_score?: number;
  accessibility_score?: number;
  competitor_comparison?: any;
  recommendations?: any;
}

interface SEOAnalysisContextType {
  analysis: SEOAnalysis | null;
  keywords: KeywordData[] | null;
  isLoading: boolean;
  fetchAnalysis: (domain: string) => Promise<void>;
}

const SEOAnalysisContext = createContext<SEOAnalysisContextType | undefined>(undefined);

export const useSEOAnalysis = () => {
  const context = useContext(SEOAnalysisContext);
  if (!context) {
    throw new Error('useSEOAnalysis must be used within a SEOAnalysisProvider');
  }
  return context;
};

export const SEOAnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [keywords, setKeywords] = useState<KeywordData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnalysis = async (domain: string) => {
    if (!user) {
      toast.error('Please sign in to analyze domains');
      return;
    }
    if (!domain.trim()) {
      toast.error('Please provide a domain');
      return;
    }

    try {
      setIsLoading(true);
      // Normalize domain to include protocol
      const normalized = domain.startsWith('http') ? domain : `https://${domain}`;

      // Trigger SEO analysis (technical, performance, backlinks)
      const { data: seoData, error: seoError } = await supabase.functions.invoke('analyze-seo', {
        body: JSON.stringify({ domain: normalized, user_id: user.id })
      });

      if (seoError) throw seoError;

      if (seoData?.success) {
        setAnalysis(seoData.analysis);
      } else {
        throw new Error(seoData?.error || 'SEO analysis failed');
      }

      // Trigger keyword analysis in parallel
      const { data: kwData, error: kwError } = await supabase.functions.invoke('analyze-domain-keywords', {
        body: JSON.stringify({ domain: normalized, user_id: user.id })
      });

      if (kwError) {
        console.error('Keyword analysis error:', kwError);
      } else if (kwData?.keywords) {
        setKeywords(kwData.keywords);
      }

      toast.success('Domain analysis completed!');
    } catch (err: any) {
      console.error('SEO analysis failed:', err);
      toast.error(err.message || 'SEO analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SEOAnalysisContext.Provider value={{ analysis, keywords, isLoading, fetchAnalysis }}>
      {children}
    </SEOAnalysisContext.Provider>
  );
}; 