
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
  }>;
}

const SEOAnalyzer = () => {
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
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'No SEO analysis data returned');
      }
      
      console.log('SEO analysis completed:', data);
      setResults(data);
      toast.success(`SEO analysis completed! Total score: ${data.scores.total}/100`);
      
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
      </div>
    </div>
  );
};

export default SEOAnalyzer;
