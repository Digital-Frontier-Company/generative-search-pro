import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDomain } from '@/contexts/DomainContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Bell, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  Activity,
  Brain,
  Globe,
  BarChart3,
  Users,
  Zap,
  Award,
  ExternalLink,
  Download,
  Settings,
  Loader2
} from 'lucide-react';

// Enhanced interfaces for citation tracking
interface EnhancedCitationResult {
  id: string;
  query: string;
  domain: string;
  aiEngines: {
    chatgpt: CitationEngineResult;
    claude: CitationEngineResult;
    perplexity: CitationEngineResult;
    bing: CitationEngineResult;
    gemini: CitationEngineResult;
  };
  overallScore: number;
  competitorAnalysis: CompetitorCitation[];
  trendData: TrendPoint[];
  recommendations: string[];
  lastChecked: string;
  nextCheck: string;
  alertsEnabled: boolean;
}

interface CitationEngineResult {
  isCited: boolean;
  citationPosition?: number;
  totalSources: number;
  confidenceScore: number;
  aiAnswer: string;
  citedSources: CitationSource[];
  contextualRelevance: number;
  authorityScore: number;
}

interface CitationSource {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  isYourDomain: boolean;
  authorityScore: number;
  relevanceScore: number;
  publishDate?: string;
}

interface CompetitorCitation {
  domain: string;
  citationCount: number;
  averagePosition: number;
  citationShare: number;
  strengthAreas: string[];
  weaknessAreas: string[];
}

interface TrendPoint {
  date: string;
  chatgptCitations: number;
  claudeCitations: number;
  perplexityCitations: number;
  bingCitations: number;
  overallScore: number;
}

interface MonitoringAlert {
  id: string;
  query: string;
  engines: string[];
  alertTypes: ('citation_gained' | 'citation_lost' | 'position_changed' | 'competitor_movement')[];
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: string;
}

const EnhancedCitationTracker = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  
  const [domain, setDomain] = useState(defaultDomain || '');
  const [queries, setQueries] = useState<string>('');
  const [results, setResults] = useState<EnhancedCitationResult[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracker');
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['chatgpt', 'claude', 'perplexity', 'bing', 'gemini']);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [bulkQueries, setBulkQueries] = useState('');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain]);

  useEffect(() => {
    loadExistingResults();
    loadAlerts();
  }, []);

  const loadExistingResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citation_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process and set results
      if (data) {
        setResults(data.map(processStoredResult));
      }
    } catch (error) {
      console.error('Error loading citation results:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citation_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      if (data) setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const processStoredResult = (data: any): EnhancedCitationResult => {
    // Transform stored data back to our interface
    return {
      id: data.id,
      query: data.query,
      domain: data.domain,
      aiEngines: data.ai_engines || {},
      overallScore: data.overall_score || 0,
      competitorAnalysis: data.competitor_analysis || [],
      trendData: data.trend_data || [],
      recommendations: data.recommendations || [],
      lastChecked: data.last_checked,
      nextCheck: data.next_check,
      alertsEnabled: data.alerts_enabled || false
    };
  };

  const runCitationCheck = async (queryList?: string[]) => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to track');
      return;
    }

    if (!queries.trim() && !queryList) {
      toast.error('Please enter at least one query to check');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to track citations');
        return;
      }

      const queryArray = queryList || queries.split('\n').map(q => q.trim()).filter(q => q);
      
      const { data, error } = await supabase.functions.invoke('enhanced-citation-check', {
        body: JSON.stringify({
          domain: domain.trim(),
          queries: queryArray,
          engines: selectedEngines,
          user_id: user.id,
          include_competitors: true,
          include_trends: true
        })
      });

      if (error) throw error;

      const enhancedResults = data.results.map((result: any) => processEnhancedResult(result));
      setResults(prev => [...enhancedResults, ...prev]);
      setActiveTab('results');
      toast.success(`Citation tracking completed for ${queryArray.length} queries`);

    } catch (error: any) {
      console.error('Citation check error:', error);
      toast.error(error.message || 'Failed to check citations');
    } finally {
      setLoading(false);
    }
  };

  const processEnhancedResult = (data: any): EnhancedCitationResult => {
    return {
      id: `citation_${Date.now()}_${Math.random()}`,
      query: data.query,
      domain: data.domain,
      aiEngines: data.ai_engines,
      overallScore: calculateOverallScore(data.ai_engines),
      competitorAnalysis: data.competitor_analysis || [],
      trendData: data.trend_data || [],
      recommendations: generateRecommendations(data),
      lastChecked: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      alertsEnabled: false
    };
  };

  const calculateOverallScore = (engines: any): number => {
    const scores = Object.values(engines).map((engine: any) => {
      if (!engine.isCited) return 0;
      const positionScore = engine.citationPosition ? (11 - engine.citationPosition) * 10 : 50;
      const confidenceScore = engine.confidenceScore || 50;
      return (positionScore + confidenceScore) / 2;
    });
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const generateRecommendations = (data: any): string[] => {
    const recommendations: string[] = [];
    
    Object.entries(data.ai_engines).forEach(([engine, result]: [string, any]) => {
      if (!result.isCited) {
        recommendations.push(`Optimize content structure for ${engine} by adding more FAQ sections and direct answers`);
      } else if (result.citationPosition && result.citationPosition > 3) {
        recommendations.push(`Improve ${engine} citation ranking by enhancing content authority and relevance`);
      }
    });

    if (data.competitor_analysis && data.competitor_analysis.length > 0) {
      const topCompetitor = data.competitor_analysis[0];
      recommendations.push(`Study ${topCompetitor.domain}'s content strategy - they have ${topCompetitor.citationCount} citations`);
    }

    return recommendations;
  };

  const createAlert = async (result: EnhancedCitationResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAlert: Omit<MonitoringAlert, 'id' | 'createdAt'> = {
        query: result.query,
        engines: selectedEngines,
        alertTypes: ['citation_gained', 'citation_lost', 'position_changed'],
        frequency: 'daily',
        isActive: true
      };

      const { data, error } = await supabase
        .from('citation_alerts')
        .insert({
          ...newAlert,
          user_id: user.id,
          domain: result.domain,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setAlerts(prev => [...prev, { ...newAlert, id: data.id, createdAt: data.created_at }]);
      toast.success('Alert created successfully');

    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    }
  };

  const runBulkCheck = async () => {
    if (!bulkQueries.trim()) {
      toast.error('Please enter queries for bulk checking');
      return;
    }

    const queryList = bulkQueries.split('\n').map(q => q.trim()).filter(q => q);
    
    if (queryList.length === 0) {
      toast.error('No valid queries found');
      return;
    }

    if (queryList.length > 50) {
      toast.error('Maximum 50 queries allowed for bulk checking');
      return;
    }

    await runCitationCheck(queryList);
    setBulkQueries('');
  };

  const EngineScoreCard = ({ 
    engineName, 
    result, 
    icon 
  }: { 
    engineName: string; 
    result: CitationEngineResult; 
    icon: React.ReactNode;
  }) => (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{engineName}</span>
          </div>
          <Badge variant={result.isCited ? "default" : "secondary"}>
            {result.isCited ? `#${result.citationPosition}` : 'Not Cited'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Confidence</span>
            <span>{result.confidenceScore}%</span>
          </div>
          <Progress value={result.confidenceScore} className="h-2" />
          
          <div className="flex justify-between text-sm">
            <span>Authority</span>
            <span>{result.authorityScore}%</span>
          </div>
          <Progress value={result.authorityScore} className="h-2" />
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          {result.totalSources} sources checked
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3 mb-3">
          <Target className="w-10 h-10 text-primary" />
          Enhanced Citation Tracker
        </h1>
        <p className="text-xl text-muted-foreground">
          Advanced AI citation monitoring with competitive analysis and real-time alerts
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tracker">Citation Tracker</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Analysis</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Citation Tracking Configuration
              </CardTitle>
              <CardDescription>
                Track your domain's citations across multiple AI engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Domain to Track</label>
                  <Input
                    placeholder="Enter your domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium">AI Engines to Check</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'chatgpt', label: 'ChatGPT' },
                      { id: 'claude', label: 'Claude' },
                      { id: 'perplexity', label: 'Perplexity' },
                      { id: 'bing', label: 'Bing Copilot' },
                      { id: 'gemini', label: 'Gemini' }
                    ].map(engine => (
                      <div key={engine.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={engine.id}
                          checked={selectedEngines.includes(engine.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEngines(prev => [...prev, engine.id]);
                            } else {
                              setSelectedEngines(prev => prev.filter(id => id !== engine.id));
                            }
                          }}
                        />
                        <label htmlFor={engine.id} className="text-sm">{engine.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Search Queries (one per line)</label>
                <Textarea
                  placeholder={`Enter queries to check for citations, for example:
What is SEO optimization?
How to improve website ranking?
Best digital marketing strategies`}
                  value={queries}
                  onChange={(e) => setQueries(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={monitoringEnabled}
                    onCheckedChange={setMonitoringEnabled}
                  />
                  <label className="text-sm font-medium">Enable Real-time Monitoring</label>
                </div>
                
                <Button 
                  onClick={() => runCitationCheck()} 
                  disabled={loading || !domain.trim() || !queries.trim()}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Checking Citations...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Check Citations
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 mt-6">
          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((result, index) => (
                <Card key={result.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{result.query}</CardTitle>
                        <CardDescription>{result.domain}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          Overall: {result.overallScore}%
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => createAlert(result)}>
                          <Bell className="w-4 h-4 mr-2" />
                          Create Alert
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* AI Engine Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <EngineScoreCard
                        engineName="ChatGPT"
                        result={result.aiEngines.chatgpt}
                        icon={<Brain className="w-5 h-5 text-green-500" />}
                      />
                      <EngineScoreCard
                        engineName="Claude"
                        result={result.aiEngines.claude}
                        icon={<Brain className="w-5 h-5 text-blue-500" />}
                      />
                      <EngineScoreCard
                        engineName="Perplexity"
                        result={result.aiEngines.perplexity}
                        icon={<Brain className="w-5 h-5 text-purple-500" />}
                      />
                      <EngineScoreCard
                        engineName="Bing Copilot"
                        result={result.aiEngines.bing}
                        icon={<Brain className="w-5 h-5 text-orange-500" />}
                      />
                      <EngineScoreCard
                        engineName="Gemini"
                        result={result.aiEngines.gemini}
                        icon={<Brain className="w-5 h-5 text-red-500" />}
                      />
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {result.recommendations.map((rec, i) => (
                              <Alert key={i}>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{rec}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Competitor Analysis */}
                    {result.competitorAnalysis.length > 0 && (
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Competitor Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {result.competitorAnalysis.slice(0, 5).map((competitor, i) => (
                              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <div className="font-medium">{competitor.domain}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {competitor.citationCount} citations • Avg position: {competitor.averagePosition}
                                  </div>
                                </div>
                                <Badge variant="outline">
                                  {competitor.citationShare}% share
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No citation data yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run your first citation check to see how AI engines cite your content
                </p>
                <Button onClick={() => setActiveTab('tracker')}>
                  Start Tracking Citations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Bulk Citation Analysis
              </CardTitle>
              <CardDescription>
                Check multiple queries at once for comprehensive citation analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Bulk Queries (up to 50 queries, one per line)
                </label>
                <Textarea
                  placeholder={`Enter multiple queries for bulk analysis:
What is content marketing?
How to increase website traffic?
Best SEO tools 2024
Content optimization techniques
Digital marketing strategies`}
                  value={bulkQueries}
                  onChange={(e) => setBulkQueries(e.target.value)}
                  rows={10}
                />
                <div className="text-sm text-muted-foreground">
                  {bulkQueries.split('\n').filter(q => q.trim()).length} queries entered
                </div>
              </div>

              <Button 
                onClick={runBulkCheck}
                disabled={loading || !domain.trim() || !bulkQueries.trim()}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Bulk Check...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Run Bulk Citation Check
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-time Monitoring & Alerts
              </CardTitle>
              <CardDescription>
                Set up automated monitoring for citation changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{alert.query}</div>
                        <div className="text-sm text-muted-foreground">
                          Checking {alert.engines.join(', ')} • {alert.frequency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Active" : "Paused"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No active alerts</h3>
                  <p className="text-muted-foreground">
                    Create alerts from your citation results to monitor changes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {results.filter(r => Object.values(r.aiEngines).some(e => e.isCited)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Queries with Citations</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.overallScore, 0) / results.length) : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Citation Score</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{alerts.length}</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{results.length}</div>
                  <div className="text-sm text-muted-foreground">Total Queries Tracked</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Citation Performance by AI Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['chatgpt', 'claude', 'perplexity', 'bing', 'gemini'].map(engine => {
                  const citationCount = results.filter(r => r.aiEngines[engine as keyof typeof r.aiEngines]?.isCited).length;
                  const percentage = results.length > 0 ? (citationCount / results.length) * 100 : 0;
                  
                  return (
                    <div key={engine} className="flex items-center justify-between">
                      <span className="font-medium capitalize">{engine}</span>
                      <div className="flex items-center gap-3">
                        <Progress value={percentage} className="w-32" />
                        <span className="text-sm text-muted-foreground">
                          {citationCount}/{results.length} ({Math.round(percentage)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCitationTracker;
