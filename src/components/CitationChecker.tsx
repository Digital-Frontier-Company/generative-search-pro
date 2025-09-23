
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CitationResult {
  query: string;
  domain: string;
  isCited: boolean;
  aiAnswer: string;
  citedSources: any[];
  recommendations: string;
  checkedAt: string;
}

const CitationChecker = () => {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CitationResult | null>(null);
  const [history, setHistory] = useState<CitationResult[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citation_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedHistory = data?.map(item => ({
        query: item.query,
        domain: item.domain,
        isCited: item.is_cited || false,
        aiAnswer: item.ai_answer || '',
        citedSources: Array.isArray(item.cited_sources) ? item.cited_sources : [],
        recommendations: item.recommendations || '',
        checkedAt: item.checked_at
      })) || [];

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading citation history:', error);
    }
  };

  const checkCitation = async () => {
    if (!query || !domain) {
      toast.error('Please enter both query and domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to check citations');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-sge-citation', {
        body: JSON.stringify({
          query,
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id
        })
      });

      if (error) throw error;

      if (data.result) {
        setResult(data.result);
        loadHistory(); // Refresh history
        
        if (data.result.isCited) {
          toast.success('Great! Your domain is cited in the AI answer!');
        } else {
          toast.error('Your domain was not found in the AI answer');
        }
      }
    } catch (error) {
      console.error('Citation check error:', error);
      toast.error('Failed to check citation. Please ensure you have SerpApi configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SGE Citation Checker</h1>
        <p className="text-gray-600">
          Check if your website is cited in Google's AI-generated search answers (SGE).
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Check Citation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <Input
                placeholder="Enter the search query (e.g., 'best CRM software for startups')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Domain</label>
              <Input
                placeholder="Enter your domain (e.g., example.com)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <Button onClick={checkCitation} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Citation...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Check Citation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Citation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Citation Status
                <Badge variant={result.isCited ? "default" : "destructive"}>
                  {result.isCited ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Cited
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Not Cited
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Query:</h4>
                  <p className="text-gray-700">"{result.query}"</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Domain:</h4>
                  <p className="text-gray-700">{result.domain}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Checked:</h4>
                  <p className="text-gray-500 text-sm">
                    {new Date(result.checkedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Answer */}
          {result.aiAnswer && (
            <Card>
              <CardHeader>
                <CardTitle>Google's AI Answer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{result.aiAnswer}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cited Sources */}
          {result.citedSources && result.citedSources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cited Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.citedSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{source.title || 'Untitled'}</h4>
                        <p className="text-sm text-gray-600">{source.link}</p>
                      </div>
                      {source.link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={source.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && !result.isCited && (
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{result.recommendations}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Citation History */}
      {history.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Citation Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">"{item.query}"</p>
                    <p className="text-sm text-gray-600">{item.domain}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.checkedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={item.isCited ? "default" : "destructive"}>
                    {item.isCited ? "Cited" : "Not Cited"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CitationChecker;
