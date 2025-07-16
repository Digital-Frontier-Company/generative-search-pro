
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDomain } from "@/contexts/DomainContext";
import SEOResults from "./SEOResults";
import DomainInput from "./DomainInput";

interface SEOAnalysisResult {
  scores: {
    total: number;
    technical: number;
    speed: number;
    backlinks: number;
  };
  findings: Array<{
    type: string;
    status: string;
    message: string;
    url?: string;
  }>;
  coreWebVitals?: {
    lcp: number;
    fid: number;
    cls: number;
  };
  competitors?: Array<{
    domain: string;
    score: number;
  }>;
}

const SEOAnalyzer = () => {
  console.log('SEOAnalyzer component rendering');
  const [results, setResults] = useState<SEOAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeDomain = async (domain: string) => {
    // Validate domain format
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze SEO');
        return;
      }

      console.log('Starting SEO analysis for:', domain);
      
      const { data, error } = await supabase.functions.invoke('analyze-seo', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id
        })
      });
      
      if (error) {
        console.error('SEO analysis error:', error);
        throw error;
      }
      
      console.log('Raw response data:', data);
      
      // Handle both response formats from the edge function
      let analysisData;
      if (data.analysis) {
        // New format with analysis object
        analysisData = data.analysis;
      } else if (data.success && data.scores) {
        // Direct format
        analysisData = data;
      } else {
        throw new Error('Invalid response format from SEO analysis');
      }

      const { data: pageSpeedData, error: pageSpeedError } = await supabase.functions.invoke('get-pagespeed-insights', {
        body: JSON.stringify({ url: `https://${domain.trim()}` })
      });

      if (pageSpeedError) {
        console.error('PageSpeed Insights error:', pageSpeedError);
        // Don't block the main SEO analysis if PageSpeed fails
      }
      
      // Transform the data to match our expected format
      const transformedResults: SEOAnalysisResult = {
        scores: {
          total: analysisData.total_score || analysisData.scores?.total || 0,
          technical: analysisData.technical_score || analysisData.scores?.technical || 0,
          speed: analysisData.performance_score || analysisData.scores?.speed || 0,
          backlinks: analysisData.backlink_score || analysisData.scores?.backlinks || 0,
        },
        findings: analysisData.findings || analysisData.technical_findings || [],
        coreWebVitals: pageSpeedData ? pageSpeedData.coreWebVitals : undefined,
        competitors: [
          { domain: "competitor1.com", score: 85 },
          { domain: "competitor2.com", score: 82 },
          { domain: "competitor3.com", score: 78 },
        ],
      };
      
      console.log('Transformed results:', transformedResults);
      setResults(transformedResults);
      toast.success(`SEO analysis completed! Total score: ${transformedResults.scores.total}/100`);
      
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      toast.error('Failed to analyze SEO. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-white">SEO Analysis Tool</h1>
          <p className="text-gray-400 mb-8">
            Comprehensive SEO analysis including technical aspects, meta tags, performance, and backlinks.
          </p>
        </div>

        <Card className="mb-8 bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5" />
              Analyze Website SEO
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter a domain to perform comprehensive SEO analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DomainInput onAnalyze={analyzeDomain} loading={loading} />
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-white">Analyzing domain...</p>
          </div>
        )}

        <SEOResults results={results} />

        {results && (
          <>
            <Card className="mt-8 bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                {results.coreWebVitals ? (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-500">{results.coreWebVitals.lcp}s</p>
                      <p className="text-gray-400">LCP</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">{results.coreWebVitals.fid}ms</p>
                      <p className="text-gray-400">FID</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">{results.coreWebVitals.cls}</p>
                      <p className="text-gray-400">CLS</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Core Web Vitals data not available.</p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-8 bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {results.competitors && results.competitors.length > 0 ? (
                  <ul>
                    {results.competitors.map((competitor, index) => (
                      <li key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                        <span className="text-white">{competitor.domain}</span>
                        <span className="text-lg font-semibold text-blue-500">{competitor.score}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Competitor data not available.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SEOAnalyzer;
