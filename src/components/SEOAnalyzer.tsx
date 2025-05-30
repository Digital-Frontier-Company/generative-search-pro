import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Globe, CheckCircle, AlertTriangle, XCircle, Link } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TechnicalFinding {
  id: string;
  finding_type: string;
  status: string;
  message: string;
  url?: string;
}

interface SEOAnalysisResult {
  id: string;
  domain: string;
  technical_score: number;
  backlink_score: number;
  performance_score: number;
  total_score: number;
  analysis_data: any;
  status: string;
  created_at: string;
  technical_findings: TechnicalFinding[];
}

const SEOAnalyzer = () => {
  const [domain, setDomain] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);

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
      
      if (!data || !data.analysis) {
        throw new Error('No SEO analysis data returned');
      }
      
      console.log('SEO analysis completed:', data);
      setResult(data.analysis);
      toast.success(`SEO analysis completed! Total score: ${data.analysis.total_score}/100`);
      
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      toast.error('Failed to analyze SEO. Please check the URL and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
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
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter domain (e.g., example.com or https://example.com)"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-base bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !domain.trim()}
                className="min-w-[120px] bg-green-600 hover:bg-green-700"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze SEO
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Score Overview */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">SEO Score Overview for {result.domain}</CardTitle>
                <CardDescription className="text-gray-400">
                  Analyzed on {new Date(result.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(result.technical_score)}`}>
                      {result.technical_score}
                    </div>
                    <div className="text-gray-400">Technical Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(result.backlink_score)}`}>
                      {result.backlink_score}
                    </div>
                    <div className="text-gray-400 flex items-center justify-center gap-1">
                      <Link className="h-4 w-4" />
                      Backlink Score
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(result.performance_score || 0)}`}>
                      {result.performance_score || 0}
                    </div>
                    <div className="text-gray-400">Performance Score</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(result.total_score)}`}>
                      {result.total_score}
                    </div>
                    <div className="text-gray-400">Total Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Findings */}
            {result.technical_findings && result.technical_findings.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Analysis Findings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Detailed analysis results including technical, performance, and backlink metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Type</TableHead>
                          <TableHead className="text-gray-300">Message</TableHead>
                          <TableHead className="text-gray-300">URL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.technical_findings.map((finding) => (
                          <TableRow key={finding.id} className="border-gray-700">
                            <TableCell className="flex items-center gap-2">
                              {getStatusIcon(finding.status)}
                              <Badge 
                                variant={finding.status === 'good' ? 'default' : finding.status === 'warning' ? 'secondary' : 'destructive'}
                                className="capitalize"
                              >
                                {finding.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300 capitalize">
                              {finding.finding_type.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="text-gray-300">{finding.message}</TableCell>
                            <TableCell className="text-gray-400 text-sm">
                              {finding.url && (
                                <a href={finding.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-400">
                                  {finding.url.length > 50 ? finding.url.substring(0, 50) + '...' : finding.url}
                                </a>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Data */}
            {result.analysis_data && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Detailed Analysis Data</CardTitle>
                  <CardDescription className="text-gray-400">
                    Raw analysis information including performance and backlink metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-800 p-4 rounded-lg overflow-auto text-sm text-gray-300">
                    {JSON.stringify(result.analysis_data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOAnalyzer;
