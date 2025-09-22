

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { ExternalLink, Search, TrendingUp, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';

interface CitationResult {
  query: string;
  domain: string;
  isCited: boolean;
  aiAnswer: string;
  citedSources: CitationSource[];
  recommendations: string;
  checkedAt: string;
  confidenceScore?: number;
  competitorAnalysis?: CompetitorCitation[];
  citationPosition?: number;
  totalSources?: number;
  queryComplexity?: 'simple' | 'medium' | 'complex';
  improvementAreas?: string[];
  engine?: 'google' | 'bing';
}

interface CitationSource {
  title: string;
  link: string;
  snippet?: string;
  domain?: string;
  isYourDomain?: boolean;
}

interface CompetitorCitation {
  domain: string;
  citationCount: number;
  queries: string[];
  averagePosition: number;
}

interface BulkCheckQuery {
  id: string;
  query: string;
  status: 'pending' | 'checking' | 'completed' | 'error';
  result?: CitationResult;
}

const CitationChecker = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CitationResult | null>(null);
  const [history, setHistory] = useState<CitationResult[]>([]);
  const [activeTab, setActiveTab] = useState('single');
  const [engine, setEngine] = useState<'google' | 'bing'>('google');
  
  // Bulk checking state
  const [bulkQueries, setBulkQueries] = useState<BulkCheckQuery[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Monitoring state
  const [monitoredQueries, setMonitoredQueries] = useState<string[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    loadHistory();
    loadMonitoredQueries();
  }, []);

  // Pre-populate domain field with default domain when available
  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citation_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('checked_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const formattedHistory = data?.map(item => ({
        query: item.query,
        domain: item.domain,
        isCited: item.is_cited || false,
        aiAnswer: item.ai_answer || '',
        citedSources: Array.isArray(item.cited_sources) ? (item.cited_sources as unknown as CitationSource[]).map((source: CitationSource) => ({
          ...source,
          isYourDomain: source.link && source.link.includes(item.domain)
        })) : [],
        recommendations: item.recommendations || '',
        checkedAt: item.checked_at,
        confidenceScore: item.confidence_score,
        competitorAnalysis: Array.isArray(item.competitor_analysis) ? (item.competitor_analysis as unknown as CompetitorCitation[]) : [],
        citationPosition: item.citation_position,
        totalSources: item.total_sources,
        queryComplexity: (['simple','medium','complex'].includes(item.query_complexity) ? item.query_complexity : 'medium') as 'simple' | 'medium' | 'complex',
        improvementAreas: Array.isArray(item.improvement_areas) ? item.improvement_areas.map(area => String(area)) : []
      })) || [];

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading citation history:', error);
    }
  };

  const loadMonitoredQueries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citation_checks')
        .select('query')
        .eq('user_id', user.id);

      if (error) throw error;
      
      setMonitoredQueries(data?.map(item => item.query) || []);
    } catch (error) {
      console.error('Error loading monitored queries:', error);
    }
  };

  const checkCitation = async (queryToCheck?: string, domainToCheck?: string) => {
    const checkQuery = queryToCheck || query;
    const checkDomain = domainToCheck || domain;
    
    if (!checkQuery || !checkDomain) {
      toast.error('Please enter both query and domain');
      return null;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to check citations');
        return null;
      }

      const functionName = engine === 'google' ? 'check-sge-citation' : 'check-bing-citation';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: JSON.stringify({
          query: checkQuery,
          domain: checkDomain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          include_competitor_analysis: true,
          include_improvement_suggestions: true
        })
      });

      if (error) throw error;

      if (data) {
        const serverResult = data as CitationResult;
        const enhancedResult: CitationResult = {
          ...serverResult,
          citedSources: serverResult.citedSources?.map((source) => ({
            ...source,
            isYourDomain: source.link?.includes(checkDomain.replace(/^https?:\/\//, '')) ?? false,
          })) ?? [],
        };

        if (!queryToCheck) {
          setResult(enhancedResult);
          loadHistory(); // Refresh history
        }

        if (enhancedResult.isCited) {
          toast.success(`Great! Your domain is cited in position ${enhancedResult.citationPosition || 'unknown'}!`);
        } else {
          toast.error('Your domain was not found in the AI answer');
        }

                return enhancedResult;
      }
            } catch (error: unknown) {
      console.error('Citation check error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to check citation.';
      toast.error(errMessage + ' Please ensure you have SerpApi configured.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCheck = async () => {
    if (!bulkInput.trim()) {
      toast.error('Please enter queries to check');
      return;
    }

    const queries = bulkInput.split('\n').filter(q => q.trim()).map((q, index) => ({
      id: `bulk-${index}`,
      query: q.trim(),
      status: 'pending' as const
    }));

    setBulkQueries(queries);
    setBulkLoading(true);

    for (let i = 0; i < queries.length; i++) {
      setBulkQueries(prev => prev.map(q => 
        q.id === queries[i].id ? { ...q, status: 'checking' } : q
      ));

      try {
        const result = await checkCitation(queries[i].query, domain);
        setBulkQueries(prev => prev.map(q => 
          q.id === queries[i].id ? { ...q, status: 'completed', result } : q
        ));
      } catch (error) {
        setBulkQueries(prev => prev.map(q => 
          q.id === queries[i].id ? { ...q, status: 'error' } : q
        ));
      }

      // Add delay to avoid rate limiting (reduced from fake 2000ms)
      if (i < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setBulkLoading(false);
    toast.success('Bulk citation check completed!');
  };

  const addToMonitoring = async (queryToMonitor: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('citation_checks')
        .insert({
          user_id: user.id,
          query: queryToMonitor,
          domain: domain.replace(/^https?:\/\//, ''),
          is_active: true,
          check_frequency: 'daily'
        });

      if (error) throw error;

      setMonitoredQueries(prev => [...prev, queryToMonitor]);
      toast.success('Query added to monitoring!');
    } catch (error) {
      console.error('Error adding to monitoring:', error);
      toast.error('Failed to add query to monitoring');
    }
  };

  const exportResults = () => {
    const csvContent = [
      ['Query', 'Domain', 'Cited', 'Position', 'Confidence Score', 'Date'].join(','),
      ...history.map(item => [
        `"${item.query}"`,
        item.domain,
        item.isCited ? 'Yes' : 'No',
        item.citationPosition || 'N/A',
        item.confidenceScore || 'N/A',
        new Date(item.checkedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citation-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getComplexityBadge = (complexity?: string) => {
    const colors = {
      simple: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      complex: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Citation Checker</h1>
        <p className="text-gray-600">
          Check if your domain is cited in Google's AI answers with advanced analytics and monitoring
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="single">Single Check</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Check</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Citation Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Search Query</label>
                  <Input
                    placeholder="Enter your search query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkCitation()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Domain</label>
                  <Input
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkCitation()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Search Engine</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value as 'google' | 'bing')}
                >
                  <option value="google">Google (SGE)</option>
                  <option value="bing">Bing</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => checkCitation()} 
                  disabled={loading || !query || !domain}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking Citation...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Check Citation
                    </>
                  )}
                </Button>
                {query && !monitoredQueries.includes(query) && (
                  <Button 
                    variant="outline" 
                    onClick={() => addToMonitoring(query)}
                  >
                    Monitor Query
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Citation Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Citation Status</span>
                    <Badge variant={result.isCited ? "default" : "destructive"} className="text-lg px-4 py-2">
                      {result.isCited ? '✓ Cited' : '✗ Not Cited'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.citationPosition || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">Citation Position</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.totalSources || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Sources</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Progress 
                          value={result.confidenceScore || 0} 
                          className="w-16 h-2"
                        />
                        <span className="ml-2 text-sm font-medium">
                          {result.confidenceScore || 0}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">Confidence</div>
                    </div>
                    <div className="text-center">
                      <Badge className={getComplexityBadge(result.queryComplexity)}>
                        {result.queryComplexity || 'medium'}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">Query Complexity</div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    Checked on {new Date(result.checkedAt).toLocaleString()}
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

              {/* Enhanced Cited Sources */}
              {result.citedSources && result.citedSources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cited Sources ({result.citedSources.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.citedSources.map((source, index) => (
                        <div key={index} className={`p-4 border rounded-lg ${source.isYourDomain ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                {source.isYourDomain && (
                                  <Badge variant="default" className="text-xs">Your Domain</Badge>
                                )}
                              </div>
                              <h4 className="font-medium mb-1">{source.title || 'Untitled'}</h4>
                              <p className="text-sm text-blue-600 mb-2">{source.link}</p>
                              {source.snippet && (
                                <p className="text-sm text-gray-600">{source.snippet}</p>
                              )}
                            </div>
                            {source.link && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={source.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Competitor Analysis */}
              {result.competitorAnalysis && result.competitorAnalysis.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Citation Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.competitorAnalysis.map((competitor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{competitor.domain}</h4>
                            <p className="text-sm text-gray-600">
                              {competitor.citationCount} citations • Avg position: {competitor.averagePosition}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {competitor.queries.length} queries
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Recommendations */}
              {result.recommendations && !result.isCited && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="whitespace-pre-wrap text-yellow-800">{result.recommendations}</div>
                      </div>
                      
                      {result.improvementAreas && result.improvementAreas.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Improvement Areas:</h4>
                          <div className="flex flex-wrap gap-2">
                            {result.improvementAreas.map((area, index) => (
                              <Badge key={index} variant="secondary">{area}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Citation Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Domain</label>
                <Input
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Queries (one per line)
                </label>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
                  placeholder="Enter multiple queries, one per line..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleBulkCheck} 
                disabled={bulkLoading || !bulkInput.trim() || !domain}
                className="w-full"
              >
                {bulkLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking Citations...
                  </>
                ) : (
                  'Start Bulk Check'
                )}
              </Button>
            </CardContent>
          </Card>

          {bulkQueries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bulk Check Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bulkQueries.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">"{item.query}"</p>
                        {item.result && (
                          <p className="text-xs text-gray-500">
                            Position: {item.result.citationPosition || 'N/A'} | 
                            Confidence: {item.result.confidenceScore || 0}%
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'checking' && (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        )}
                        <Badge 
                          variant={
                            item.status === 'completed' 
                              ? (item.result?.isCited ? 'default' : 'destructive')
                              : item.status === 'error' 
                              ? 'destructive' 
                              : 'secondary'
                          }
                        >
                          {item.status === 'completed' 
                            ? (item.result?.isCited ? 'Cited' : 'Not Cited')
                            : item.status.charAt(0).toUpperCase() + item.status.slice(1)
                          }
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Automated Monitoring</h3>
                    <p className="text-sm text-gray-600">
                      Get notified when your citation status changes for monitored queries
                    </p>
                  </div>
                  <Badge variant={alertsEnabled ? "default" : "secondary"}>
                    {alertsEnabled ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {monitoredQueries.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium">Monitored Queries ({monitoredQueries.length})</h4>
                    {monitoredQueries.map((query, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm">"{query}"</span>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No queries being monitored. Add queries from the Single Check tab.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Citation Analytics
                </span>
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {history.filter(h => h.isCited).length}
                  </div>
                  <div className="text-sm text-gray-600">Successful Citations</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {history.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Checks</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {history.length > 0 ? Math.round((history.filter(h => h.isCited).length / history.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Citation History</h4>
                {history.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">"{item.query}"</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-500">{item.domain}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.checkedAt).toLocaleDateString()}
                        </p>
                        {item.confidenceScore && (
                          <span className="text-xs text-gray-500">
                            Confidence: {item.confidenceScore}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.citationPosition && (
                        <Badge variant="outline" className="text-xs">
                          #{item.citationPosition}
                        </Badge>
                      )}
                      <Badge variant={item.isCited ? "default" : "destructive"}>
                        {item.isCited ? 'Cited' : 'Not Cited'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CitationChecker;
