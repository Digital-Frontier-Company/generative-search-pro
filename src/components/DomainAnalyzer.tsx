
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useDomain } from "@/contexts/DomainContext";

interface KeywordData {
  word: string;
  count: number;
  percentage: number;
}

interface AnalysisResult {
  domain: string;
  totalWords: number;
  keywords: KeywordData[];
  analyzedAt: string;
}

const DomainAnalyzer = () => {
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Auto-populate with default domain when available
  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain to analyze");
      return;
    }

    // Validate domain format
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      toast.error("Please enter a valid domain (e.g., example.com)");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to analyze domains');
        return;
      }

      console.log('Analyzing domain:', domain);
      
      const { data, error } = await supabase.functions.invoke('analyze-domain-keywords', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id
        })
      });
      
      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }
      
      if (!data || !data.keywords) {
        throw new Error('No analysis data returned');
      }
      
      console.log('Analysis completed:', data);
      setResult(data);
      toast.success(`Analysis completed! Found ${data.keywords.length} key terms`);
      
    } catch (error) {
      console.error('Error analyzing domain:', error);
      toast.error('Failed to analyze domain. Please check the URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Domain Keyword Analysis</h1>
          <p className="text-gray-600 mb-8">
            Analyze any website to discover the most frequently used keywords and their density percentages.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Analyze Website Keywords
            </CardTitle>
            <CardDescription>
              Enter a domain to analyze its content and extract keyword frequency data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter domain (e.g., example.com or https://example.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-base"
                />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !domain.trim()}
                className="min-w-[120px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results for {result.domain}</CardTitle>
              <CardDescription>
                Analyzed on {new Date(result.analyzedAt).toLocaleString()} • 
                Total words processed: {result.totalWords.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Top Keywords by Frequency</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {result.keywords.slice(0, 20).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {keyword.word} ({keyword.percentage.toFixed(1)}%)
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.keywords.map((keyword, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{keyword.word}</TableCell>
                        <TableCell className="text-right">{keyword.count}</TableCell>
                        <TableCell className="text-right">{keyword.percentage.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DomainAnalyzer;
