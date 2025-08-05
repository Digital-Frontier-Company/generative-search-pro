import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Target,
  Brain,
  Users,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  ShoppingCart,
  MapPin,
  FileText,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface IntentAnalysis {
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  indicators: string[];
  suggestedContent: string;
}

interface AIResponse {
  platform: string;
  query: string;
  response: string;
  citedSources: string[];
  responseLength: number;
  keyTopics: string[];
  gaps: string[];
  opportunities: string[];
}

interface ContentGap {
  topic: string;
  gap: string;
  priority: 'high' | 'medium' | 'low';
  searchVolume: number;
  currentCoverage: number;
  suggestedContent: string;
  estimatedTraffic: number;
}

interface IntentResearchData {
  domain: string;
  queriesAnalyzed: number;
  intentDistribution: {
    informational: number;
    navigational: number;
    transactional: number;
    commercial: number;
  };
  aiResponses: AIResponse[];
  contentGaps: ContentGap[];
  topicClusters: Array<{
    cluster: string;
    topics: string[];
    coverage: number;
    opportunity: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }>;
  lastAnalyzed: string;
}

const IntentDrivenResearch = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [targetQueries, setTargetQueries] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState<IntentResearchData | null>(null);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const conductIntentResearch = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to research');
      return;
    }

    if (!user) {
      toast.error('Please sign in to conduct intent research');
      return;
    }

    setLoading(true);
    try {
      const queriesList = targetQueries.trim() 
        ? targetQueries.split(',').map(q => q.trim()).filter(q => q)
        : [];

      const competitorsList = competitors.trim()
        ? competitors.split(',').map(c => c.trim()).filter(c => c)
        : [];

      const { data, error } = await supabase.functions.invoke('conduct-intent-research', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          target_queries: queriesList,
          competitors: competitorsList,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setResearchData(data.research);
        setActiveTab('analysis');
        toast.success('Intent-driven research completed!');
      }
    } catch (error: any) {
      console.error('Intent research error:', error);
      toast.error(error.message || 'Failed to conduct intent research');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'informational': return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case 'navigational': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'transactional': return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'commercial': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default: return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Intent-Driven Research</h1>
        <p className="text-matrix-green/70">
          Research AI platform responses to understand user intent and identify content opportunities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="setup">Research Setup</TabsTrigger>
          <TabsTrigger value="analysis">Intent Analysis</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="clusters">Topic Clusters</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Configure Research Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">Domain to Research</label>
                  <Input
                    placeholder="Enter your domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">
                    Target Queries (optional)
                  </label>
                  <Textarea
                    placeholder="Enter specific queries to research, separated by commas..."
                    value={targetQueries}
                    onChange={(e) => setTargetQueries(e.target.value)}
                    className="bg-secondary border-border min-h-[100px]"
                  />
                  <p className="text-xs text-matrix-green/60 mt-1">
                    Leave empty to auto-generate queries based on your domain
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">
                    Competitors (optional)
                  </label>
                  <Input
                    placeholder="Enter competitor domains, separated by commas"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <Button 
                  onClick={conductIntentResearch} 
                  disabled={loading} 
                  className="w-full glow-button text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Conducting Research...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Start Intent Research
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {researchData ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {researchData.queriesAnalyzed}
                      </div>
                      <p className="text-sm text-matrix-green/70">Queries Analyzed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {researchData.aiResponses.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">AI Responses</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {researchData.contentGaps.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Content Gaps</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="content-card">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {researchData.topicClusters.length}
                      </div>
                      <p className="text-sm text-matrix-green/70">Topic Clusters</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Intent Distribution */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Search Intent Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(researchData.intentDistribution).map(([intent, percentage]) => (
                      <div key={intent} className="flex items-center gap-3">
                        {getIntentIcon(intent)}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-matrix-green capitalize">{intent}</span>
                            <span className="text-sm text-matrix-green">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Platform Responses */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">AI Platform Response Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {researchData.aiResponses.slice(0, 5).map((response, index) => (
                      <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                              {response.platform}
                            </Badge>
                            <span className="text-sm text-matrix-green/70">
                              {response.responseLength} chars
                            </span>
                          </div>
                          <span className="text-sm text-matrix-green/70">
                            {response.citedSources.length} sources
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-matrix-green mb-2">{response.query}</h4>
                        <p className="text-matrix-green/90 text-sm mb-3">
                          {response.response.substring(0, 200)}...
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-matrix-green mb-1">Key Topics</h5>
                            <div className="flex flex-wrap gap-1">
                              {response.keyTopics.slice(0, 3).map((topic, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-matrix-green mb-1">Opportunities</h5>
                            <p className="text-xs text-matrix-green/70">
                              {response.opportunities.length} content opportunities identified
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Research Data Yet
                </h3>
                <p className="text-matrix-green/70">
                  Configure your research parameters and start the analysis to see intent data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gaps">
          {researchData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Content Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {researchData.contentGaps.map((gap, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(gap.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{gap.topic}</h4>
                            <Badge className={`text-xs ${getPriorityColor(gap.priority)}`}>
                              {gap.priority}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-3">{gap.gap}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-matrix-green/70">Search Volume</p>
                              <p className="font-semibold text-matrix-green">{gap.searchVolume.toLocaleString()}/month</p>
                            </div>
                            <div>
                              <p className="text-sm text-matrix-green/70">Current Coverage</p>
                              <div className="flex items-center gap-2">
                                <Progress value={gap.currentCoverage} className="h-2 flex-1" />
                                <span className="text-sm text-matrix-green">{gap.currentCoverage}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-matrix-green/70">Est. Traffic</p>
                              <p className="font-semibold text-matrix-green">{gap.estimatedTraffic.toLocaleString()}/month</p>
                            </div>
                          </div>
                          
                          <div className="bg-secondary/30 p-3 rounded border">
                            <p className="text-sm text-matrix-green/80 mb-2">Suggested Content:</p>
                            <p className="text-matrix-green/90 text-sm">{gap.suggestedContent}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(gap.suggestedContent)}
                              className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10 mt-2"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Gap Analysis Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the research to identify content gaps and opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="clusters">
          {researchData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Topic Cluster Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchData.topicClusters.map((cluster, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <h4 className="font-semibold text-matrix-green mb-3">{cluster.cluster}</h4>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-matrix-green/70">Coverage</span>
                            <span className="text-sm text-matrix-green">{cluster.coverage}%</span>
                          </div>
                          <Progress value={cluster.coverage} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-matrix-green/70">Opportunity</span>
                            <span className="text-sm text-matrix-green">{cluster.opportunity}%</span>
                          </div>
                          <Progress value={cluster.opportunity} className="h-2" />
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium text-matrix-green mb-2">Related Topics</h5>
                        <div className="flex flex-wrap gap-1">
                          {cluster.topics.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Cluster Analysis Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the research to see topic clustering insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {researchData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Content Strategy Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {researchData.recommendations.map((rec, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{rec.title}</h4>
                            <Badge className={`text-xs ${getPriorityColor(rec.priority)}`}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {rec.type}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-2">{rec.description}</p>
                          <div className="flex items-center gap-2 text-sm text-matrix-green/70">
                            <Zap className="w-3 h-3" />
                            <span>Expected Impact: {rec.estimatedImpact}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-matrix-green/70">
                  Complete the research to get strategic content recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {researchData && (
        <div className="text-center text-sm text-matrix-green/60 mt-6">
          Last analyzed: {new Date(researchData.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default IntentDrivenResearch;