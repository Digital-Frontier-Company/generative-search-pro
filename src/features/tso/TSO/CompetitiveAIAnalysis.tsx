import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Eye,
  Crown,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Globe,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDomain } from '@/contexts/DomainContext';

interface CompetitorData {
  domain: string;
  overallScore: number;
  aiVisibilityScore: number;
  citationRate: number;
  shareOfVoice: number;
  platformPerformance: Array<{
    platform: string;
    score: number;
    citations: number;
    mentions: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  contentGaps: string[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface CompetitiveAnalysisData {
  yourDomain: string;
  competitors: CompetitorData[];
  marketOverview: {
    totalCompetitors: number;
    averageAIVisibility: number;
    marketLeader: string;
    yourRanking: number;
    shareOfVoice: number;
  };
  gapAnalysis: Array<{
    area: string;
    yourScore: number;
    competitorAverage: number;
    topCompetitorScore: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  opportunities: Array<{
    type: 'content' | 'platform' | 'keyword' | 'citation';
    opportunity: string;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    competitors: string[];
    expectedGain: string;
  }>;
  benchmarks: Array<{
    metric: string;
    yourValue: number;
    industryAverage: number;
    topPerformer: number;
    unit: string;
    status: 'above' | 'below' | 'at';
  }>;
  recommendations: Array<{
    category: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timeframe: string;
    expectedImpact: string;
  }>;
  lastAnalyzed: string;
}

const CompetitiveAIAnalysis = () => {
  const { user } = useAuth();
  const { defaultDomain } = useDomain();
  const [domain, setDomain] = useState(defaultDomain || '');
  const [competitors, setCompetitors] = useState('');
  const [targetQueries, setTargetQueries] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<CompetitiveAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState('setup');

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const runCompetitiveAnalysis = async () => {
    if (!domain.trim() || !competitors.trim()) {
      toast.error('Please enter both your domain and competitor domains');
      return;
    }

    if (!user) {
      toast.error('Please sign in to run competitive analysis');
      return;
    }

    setLoading(true);
    try {
      const competitorsList = competitors.split(',').map(c => c.trim()).filter(c => c);
      const targetQueriesList = targetQueries.trim() 
        ? targetQueries.split(',').map(q => q.trim()).filter(q => q)
        : [];

      const { data, error } = await supabase.functions.invoke('analyze-competitive-ai', {
        body: JSON.stringify({
          domain: domain.trim(),
          competitors: competitorsList,
          target_queries: targetQueriesList,
          user_id: user.id,
          comprehensive: true
        })
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisData(data.analysis);
        setActiveTab('overview');
        toast.success('Competitive AI analysis completed!');
      }
    } catch (error: any) {
      console.error('Competitive analysis error:', error);
      toast.error(error.message || 'Failed to run competitive analysis');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'above': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'below': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-matrix-green">Competitive AI Analysis</h1>
        <p className="text-matrix-green/70">
          Analyze how your AI visibility compares to competitors across platforms and identify opportunities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card className="content-card">
            <CardHeader>
              <CardTitle className="text-matrix-green flex items-center gap-2">
                <Target className="w-5 h-5" />
                Configure Competitive Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">Your Domain</label>
                  <Input
                    placeholder="Enter your domain (e.g., example.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">
                    Competitor Domains <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Enter competitor domains, separated by commas (e.g., competitor1.com, competitor2.com)"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    className="bg-secondary border-border min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-matrix-green">
                    Target Queries (optional)
                  </label>
                  <Textarea
                    placeholder="Enter specific queries to analyze competitively, separated by commas"
                    value={targetQueries}
                    onChange={(e) => setTargetQueries(e.target.value)}
                    className="bg-secondary border-border min-h-[80px]"
                  />
                  <p className="text-xs text-matrix-green/60 mt-1">
                    Leave empty to auto-generate queries based on your industry
                  </p>
                </div>
                <Button 
                  onClick={runCompetitiveAnalysis} 
                  disabled={loading} 
                  className="w-full glow-button text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Competitive Analysis...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Run Competitive Analysis
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          {analysisData ? (
            <div className="space-y-6">
              {/* Market Overview */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Market Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        #{analysisData.marketOverview.yourRanking}
                      </div>
                      <p className="text-sm text-matrix-green/70">Your Market Position</p>
                    </div>
                    
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.marketOverview.shareOfVoice}%
                      </div>
                      <p className="text-sm text-matrix-green/70">Share of Voice</p>
                    </div>
                    
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.marketOverview.totalCompetitors}
                      </div>
                      <p className="text-sm text-matrix-green/70">Competitors Analyzed</p>
                    </div>
                    
                    <div className="text-center p-4 bg-secondary/30 rounded border">
                      <div className="text-2xl font-bold text-matrix-green mb-1">
                        {analysisData.marketOverview.averageAIVisibility}
                      </div>
                      <p className="text-sm text-matrix-green/70">Market Avg AI Score</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-secondary/20 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-4 h-4 text-matrix-green" />
                      <span className="font-semibold text-matrix-green">Market Leader</span>
                    </div>
                    <p className="text-matrix-green/90">{analysisData.marketOverview.marketLeader}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Benchmarks */}
              <Card className="content-card">
                <CardHeader>
                  <CardTitle className="text-matrix-green">Performance Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.benchmarks.map((benchmark, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(benchmark.status)}
                          <div>
                            <h4 className="font-semibold text-matrix-green">{benchmark.metric}</h4>
                            <p className="text-sm text-matrix-green/70">
                              Your value: {benchmark.yourValue}{benchmark.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-matrix-green/70">Industry Avg</p>
                              <p className="font-semibold text-matrix-green">
                                {benchmark.industryAverage}{benchmark.unit}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-matrix-green/70">Top Performer</p>
                              <p className="font-semibold text-matrix-green">
                                {benchmark.topPerformer}{benchmark.unit}
                              </p>
                            </div>
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
                <BarChart3 className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Analysis Data Yet
                </h3>
                <p className="text-matrix-green/70">
                  Configure your analysis parameters and run the competitive analysis to see market overview.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="competitors">
          {analysisData ? (
            <div className="space-y-4">
              {analysisData.competitors.map((competitor, index) => (
                <Card key={index} className="content-card">
                  <CardHeader>
                    <CardTitle className="text-matrix-green flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {competitor.domain}
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(competitor.overallScore)}`}>
                        {competitor.overallScore}/100
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(competitor.aiVisibilityScore)}`}>
                          {competitor.aiVisibilityScore}/100
                        </div>
                        <p className="text-sm text-matrix-green/70">AI Visibility</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-matrix-green">
                          {competitor.citationRate}%
                        </div>
                        <p className="text-sm text-matrix-green/70">Citation Rate</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-matrix-green">
                          {competitor.shareOfVoice}%
                        </div>
                        <p className="text-sm text-matrix-green/70">Share of Voice</p>
                      </div>
                      <div className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${competitor.domain}`, '_blank')}
                          className="border-matrix-green/30 text-matrix-green hover:bg-matrix-green/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit
                        </Button>
                      </div>
                    </div>

                    {/* Platform Performance */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-matrix-green mb-3">Platform Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {competitor.platformPerformance.map((platform, pIndex) => (
                          <div key={pIndex} className="flex items-center justify-between p-3 bg-secondary/20 rounded">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-matrix-green" />
                              <span className="font-medium text-matrix-green">{platform.platform}</span>
                              {getTrendIcon(platform.trend)}
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${getScoreColor(platform.score)}`}>
                                {platform.score}/100
                              </div>
                              <div className="text-xs text-matrix-green/70">
                                {platform.citations} citations
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths and Weaknesses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-matrix-green mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {competitor.strengths.map((strength, sIndex) => (
                            <li key={sIndex} className="text-sm text-matrix-green/90 flex items-start gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-matrix-green mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {competitor.weaknesses.map((weakness, wIndex) => (
                            <li key={wIndex} className="text-sm text-matrix-green/90 flex items-start gap-2">
                              <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="content-card">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Competitor Data Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the competitive analysis to see detailed competitor breakdowns.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gaps">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.gapAnalysis.map((gap, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-matrix-green">{gap.area}</h4>
                          <Badge className={getPriorityColor(gap.priority)}>
                            {gap.priority}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${gap.gap < 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {gap.gap > 0 ? '+' : ''}{gap.gap} points
                          </div>
                          <p className="text-xs text-matrix-green/70">gap to close</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div className="text-center">
                          <p className="text-matrix-green/70">Your Score</p>
                          <p className={`font-bold ${getScoreColor(gap.yourScore)}`}>{gap.yourScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-matrix-green/70">Competitor Avg</p>
                          <p className="font-bold text-matrix-green">{gap.competitorAverage}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-matrix-green/70">Top Competitor</p>
                          <p className="font-bold text-matrix-green">{gap.topCompetitorScore}</p>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/30 p-3 rounded border">
                        <p className="text-sm text-matrix-green/80 mb-2">Recommendation:</p>
                        <p className="text-matrix-green/90 text-sm">{gap.recommendation}</p>
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
                  Run the competitive analysis to identify performance gaps.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="opportunities">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Competitive Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.opportunities.map((opp, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${opp.impact === 'high' ? 'bg-green-500/20 text-green-400' : opp.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {opp.impact} impact
                            </Badge>
                            <Badge className={`text-xs ${getDifficultyColor(opp.difficulty)}`}>
                              {opp.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {opp.type}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-matrix-green mb-2">{opp.opportunity}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-matrix-green/70 mb-1">Competing with:</p>
                              <div className="flex flex-wrap gap-1">
                                {opp.competitors.map((comp, cIndex) => (
                                  <Badge key={cIndex} variant="secondary" className="text-xs">
                                    {comp}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-matrix-green/70 mb-1">Expected gain:</p>
                              <p className="font-semibold text-matrix-green">{opp.expectedGain}</p>
                            </div>
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
                <Zap className="w-12 h-12 text-matrix-green/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-matrix-green mb-2">
                  No Opportunities Yet
                </h3>
                <p className="text-matrix-green/70">
                  Run the competitive analysis to discover optimization opportunities.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          {analysisData ? (
            <Card className="content-card">
              <CardHeader>
                <CardTitle className="text-matrix-green">Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.recommendations.map((rec, index) => (
                    <div key={index} className="border border-matrix-green/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-matrix-green mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-matrix-green">{rec.title}</h4>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-matrix-green/30 text-matrix-green">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-matrix-green/90 mb-3">{rec.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-matrix-green/70">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3" />
                              <span>Timeframe: {rec.timeframe}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              <span>Impact: {rec.expectedImpact}</span>
                            </div>
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
                  Complete the competitive analysis to get strategic recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {analysisData && (
        <div className="text-center text-sm text-matrix-green/60 mt-6">
          Last analyzed: {new Date(analysisData.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default CompetitiveAIAnalysis;