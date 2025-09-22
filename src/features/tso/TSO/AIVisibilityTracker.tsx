import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye,
  Brain,
  Search,
  TrendingUp,
  Globe,
  MessageSquare,
  Star,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Copy,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface PlatformVisibility {
  platform: string;
  score: number;
  citations: number;
  responseRate: number;
  avgPosition: number;
  trend: 'up' | 'down' | 'stable';
  lastChecked: string;
  sampleQueries: string[];
  citationExamples: Array<{
    query: string;
    response: string;
    cited: boolean;
    position?: number;
  }>;
}

interface VisibilityData {
  domain: string;
  overallScore: number;
  totalCitations: number;
  averagePosition: number;
  trackingQueries: number;
  platforms: PlatformVisibility[];
  competitorComparison: Array<{
    competitor: string;
    score: number;
    difference: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
  trends: Array<{
    date: string;
    overallScore: number;
    citations: number;
  }>;
  lastAnalyzed: string;
}

const AIVisibilityTracker = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [competitors, setCompetitors] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibilityData, setVisibilityData] = useState<VisibilityData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const trackVisibility = async () => {
    if (!domain.trim()) {
      toast.error('Please enter a domain to track');
      return;
    }

    if (!user) {
      toast.error('Please sign in to track AI visibility');
      return;
    }

    setLoading(true);
    try {
      const competitorsList = competitors.trim() 
        ? competitors.split(',').map(c => c.trim()).filter(c => c)
        : [];

      const { data, error } = await supabase.functions.invoke('track-ai-visibility', {
        body: JSON.stringify({
          domain: domain.trim(),
          user_id: user.id,
          competitors: competitorsList,
          comprehensive: true
        })
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        setVisibilityData(data.visibility);
        toast.success('AI visibility tracking completed!');
      }
    } catch (error: any) {
      console.error('Visibility tracking error:', error);
      toast.error(error.message || 'Failed to track AI visibility');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return 'text-green-500';
    }
    if (score >= 60) {
      return 'text-blue-500';
    }
    if (score >= 40) {
      return 'text-yellow-500';
    }
    return 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': 
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': 
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: 
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'chatgpt': 
        return '🤖';
      case 'perplexity': 
        return '🔍';
      case 'gemini': 
        return '💎';
      case 'claude': 
        return '🧠';
      case 'copilot': 
        return '🚁';
      default: 
        return '🌐';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': 
        return 'bg-red-500/20 text-red-400';
      case 'medium': 
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low': 
        return 'bg-green-500/20 text-green-400';
      default: 
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">AI Visibility Tracker</h1>
        <p className="text-matrix-green/70">
          Monitor how your content appears across major AI platforms and identify optimization opportunities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
          <TabsTrigger value="citations">Citation Examples</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Setup Card */}
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Track AI Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-matrix-green">Domain to Track</label>
                    <Input
                      placeholder="Enter your domain (e.g., example.com)"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      className="bg-secondary border-border"
                    />
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
                    onClick={trackVisibility} 
                    disabled={loading} 
                    className="w-full glow-button text-black font-semibold"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Tracking AI Visibility...
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Track AI Visibility
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Overview */}
            {visibilityData && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="content-card">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(visibilityData.overallScore)} mb-1`}>
                          {visibilityData.overallScore}/100
                        </div>
                        <p className="text-sm text-matrix-green/70">Overall AI Visibility</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="content-card">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green mb-1">
                          {visibilityData.totalCitations}
                        </div>
                        <p className="text-sm text-matrix-green/70">Total Citations</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="content-card">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green mb-1">
                          #{visibilityData.averagePosition}
                        </div>
                        <p className="text-sm text-matrix-green/70">Avg Citation Position</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="content-card">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-matrix-green mb-1">
                          {visibilityData.trackingQueries}
                        </div>
                        <p className="text-sm text-matrix-green/70">Tracking Queries</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Performance Summary */}
                <Card className="content-card">
                  <CardHeader>
                    <CardTitle className="text-matrix-green">Platform Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {visibilityData.platforms.map((platform, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded border">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                            <div>
                              <h4 className="font-semibold text-matrix-green">{platform.platform}</h4>
                              <p className="text-sm text-matrix-green/70">
                                {platform.citations} citations • {platform.responseRate}% response rate
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getTrendIcon(platform.trend)}
                            <div className="text-right">
                              <div className={`text-lg font-bold ${getScoreColor(platform.score)}`}>
                                {platform.score}/100
                              </div>
                              <div className="text-xs text-matrix-green/70">
                                Avg pos: #{platform.avgPosition}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Trends */}
                {visibilityData.trends.length > 0 && (
                  <Card className="content-card">
                    <CardHeader>
                      <CardTitle className="text-matrix-green">AI Visibility Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {visibilityData.trends.slice(0, 5).map((trend, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                            <span className="text-matrix-green font-medium">{trend.date}</span>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="text-center">
                                <p className="text-matrix-green/70">Score</p>
                                <p className="font-semibold text-matrix-green">{trend.overallScore}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-matrix-green/70">Citations</p>
                                <p className="font-semibold text-matrix-green">{trend.citations}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="platforms">
          {visibilityData ? (
            <div className="space-y-6">
              {visibilityData.platforms.map((platform, index) => (
                <Card key={index} className="content-card">
                  <CardHeader>
                    <CardTitle className="text-matrix-green flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getPlatformIcon(platform.platform)}</span>
                        <div>
                          <h3 className="text-xl">{platform.platform}</h3>
                          <p className="text-sm text-matrix-green/70 font-normal">
                            Last checked: {new Date(platform.lastChecked).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(platform.score)}`}>
                          {platform.score}/100
                        </div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(platform.trend)}
                          <span className="text-sm text-matrix-green/70">
                            {platform.trend}
                          </span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-secondary/30 rounded">
                        <div className="text-lg font-bold text-matrix-green">{platform.citations}</div>
                        <p className="text-sm text-matrix-green/70">Citations</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded">
                        <div className="text-lg font-bold text-matrix-green">{platform.responseRate}%</div>
                        <p className="text-sm text-matrix-green/70">Response Rate</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded">
                        <div className="text-lg font-bold text-matrix-green">#{platform.avgPosition}</div>
                        <p className="text-sm text-matrix-green/70">Avg Position</p>
                      </div>
                      <div className="text-center p-3 bg-secondary/30 rounded">
                        <div className="text-lg font-bold text-matrix-green">{platform.sampleQueries.length}</div>
                        <p className="text-sm text-matrix-green/70">Sample Queries</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-matrix-green mb-3">Sample Tracking Queries</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {platform.sampleQueries.map((query, qIndex) => (
                          <div key={qIndex} className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
                            <Search className="w-4 h-4 text-matrix-green" />
                            <span className="text-sm text-matrix-green/90">{query}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Platform Data Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the AI visibility tracking to see detailed platform analysis.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="citations">
          {visibilityData ? (
            <div className="space-y-4">
              {visibilityData.platforms.map((platform, pIndex) => (
                platform.citationExamples.length > 0 && (
                  <Card key={pIndex} className="content-card">
                    <CardHeader>
                      <CardTitle className="text-matrix-green flex items-center gap-2">
                        <span className="text-xl">{getPlatformIcon(platform.platform)}</span>
                        {platform.platform} Citation Examples
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {platform.citationExamples.map((example, eIndex) => (
                          <div key={eIndex} className="border border-matrix-green/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge className={example.cited ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                  {example.cited ? '✓ Cited' : '✗ Not Cited'}
                                </Badge>
                                {example.position && (
                                  <Badge variant="outline" className="border-matrix-green/30 text-matrix-green">
                                    Position #{example.position}
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(example.response)}
                                className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            
                            <div className="mb-3">
                              <h4 className="font-semibold text-matrix-green mb-1">Query:</h4>
                              <p className="text-matrix-green/90 italic">"{example.query}"</p>
                            </div>
                            
                            <div className="bg-secondary/30 p-3 rounded border">
                              <h4 className="font-semibold text-matrix-green mb-2">AI Response:</h4>
                              <p className="text-matrix-green/90 text-sm">{example.response}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Citation Examples Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the visibility tracking to see real citation examples from AI platforms.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="competitors">
          {visibilityData && visibilityData.competitorComparison.length > 0 ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Competitive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visibilityData.competitorComparison.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded border">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-matrix-green" />
                        <div>
                          <h4 className="font-semibold text-matrix-green">{comp.competitor}</h4>
                          <p className="text-sm text-matrix-green/70">Competitor domain</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(comp.score)}`}>
                          {comp.score}/100
                        </div>
                        <div className={`text-sm ${comp.difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {comp.difference >= 0 ? '+' : ''}{comp.difference} vs you
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
                <Globe className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Competitor Data Yet
                </h3>
                <p className="text-matrix-green/70">
                  Add competitor domains and run the analysis to see competitive comparison.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {visibilityData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">AI Visibility Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visibilityData.recommendations.map((rec, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{rec.title}</h4>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {rec.type}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-2">{rec.description}</p>
                          <div className="flex items-center gap-2 text-sm text-matrix-green/70">
                            <TrendingUp className="w-3 h-3" />
                            <span>Expected Impact: {rec.expectedImpact}</span>
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
                <Star className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Recommendations Yet
                </h3>
                <p className="text-matrix-green/70">
                  Complete the AI visibility analysis to get personalized recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {visibilityData && (
        <div className="text-center text-sm text-matrix-green/60 mt-6">
          Last analyzed: {new Date(visibilityData.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default AIVisibilityTracker;