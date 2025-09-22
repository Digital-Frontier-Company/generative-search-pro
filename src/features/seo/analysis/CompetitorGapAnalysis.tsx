import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import { useDomain } from '../contexts/DomainContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  BarChart3,
  Shield,
  Settings,
  BookOpen
} from 'lucide-react';

interface CompetitorAnalysis {
  domain: string;
  citationCount: number;
  citationQueries: string[];
  citationPositions: number[];
  averagePosition: number;
  strongestQueries: string[];
  contentGaps: string[];
  authoritySignals: string[];
  technicalAdvantages: string[];
  contentStrategy: string;
}

interface GapAnalysisResult {
  userDomain: string;
  competitorDomains: string[];
  analysisQueries: string[];
  competitorAnalyses: CompetitorAnalysis[];
  overallGaps: {
    contentGaps: string[];
    authorityGaps: string[];
    technicalGaps: string[];
    strategyGaps: string[];
  };
  actionableRecommendations: string[];
  priorityOpportunities: string[];
  timeToCompete: string;
  difficultyScore: number;
  analyzedAt: string;
}

const CompetitorGapAnalysis = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [userDomain, setUserDomain] = useState('');
  const [competitorDomains, setCompetitorDomains] = useState('');
  const [analysisQueries, setAnalysisQueries] = useState('');
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GapAnalysisResult | null>(null);
  const [history, setHistory] = useState<GapAnalysisResult[]>([]);

  useEffect(() => {
    if (defaultDomain && !userDomain) {
      setUserDomain(defaultDomain);
    }
  }, [defaultDomain, userDomain]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('competitor_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Map database columns to expected interface
      const mappedData = (data || []).map(item => ({
        userDomain: item.user_domain,
        competitorDomains: Array.isArray(item.competitor_domains) ? item.competitor_domains.map(d => String(d)) : [],
        analysisQueries: Array.isArray(item.analysis_queries) ? item.analysis_queries.map(q => String(q)) : [],
        competitorAnalyses: [], // Empty array as we'll load this separately
        overallGaps: {
          contentGaps: Array.isArray(item.content_gaps) ? item.content_gaps.map(g => String(g)) : [],
          authorityGaps: [],
          technicalGaps: [],
          strategyGaps: []
        },
        actionableRecommendations: Array.isArray(item.recommendations) ? item.recommendations.map(r => String(r)) : [],
        priorityOpportunities: Array.isArray(item.gap_opportunities) ? item.gap_opportunities.map(o => String(o)) : [],
        timeToCompete: '3-6 months', // Default value
        difficultyScore: 50, // Default value
        analyzedAt: item.created_at
      }));
      
      setHistory(mappedData);
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  };

  const runGapAnalysis = async () => {
    if (!userDomain || !competitorDomains) {
      toast.error('Please enter your domain and competitor domains');
      return;
    }

    const competitors = competitorDomains.split(',').map(d => d.trim()).filter(d => d);
    if (competitors.length === 0) {
      toast.error('Please enter at least one competitor domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to run competitor analysis');
        return;
      }

      const { data, error } = await supabase.functions.invoke('competitor-gap-analysis', {
        body: JSON.stringify({
          user_domain: userDomain.replace(/^https?:\/\//, ''),
          competitor_domains: competitors.join(','),
          user_id: user.id,
          analysis_queries: analysisQueries || undefined,
          analysis_depth: analysisDepth
        })
      });

      if (error) throw error;

      setResults(data);
      loadHistory();

      const strongCompetitors = data.competitorAnalyses.filter((c: CompetitorAnalysis) => c.citationCount > 3).length;
      if (strongCompetitors > 0) {
        toast.success(`Analysis complete! Found ${strongCompetitors} strong competitors with significant citation advantages.`);
      } else {
        toast.info(`Analysis complete! Good news - no competitors have overwhelming citation advantages.`);
      }

    } catch (error: unknown) {
      console.error('Competitor analysis error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to run competitor analysis';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 40) return 'text-green-600';
    if (score <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGapIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="w-4 h-4" />;
      case 'authority': return <Shield className="w-4 h-4" />;
      case 'technical': return <Settings className="w-4 h-4" />;
      case 'strategy': return <Target className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Citation Gap Analysis</h1>
        <p className="text-gray-600">
          Discover exactly where competitors are beating you in AI search citations and how to catch up
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Competitor Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Domain *</label>
              <Input
                placeholder="yourdomain.com"
                value={userDomain}
                onChange={(e) => setUserDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Competitor Domains *</label>
              <Input
                placeholder="competitor1.com, competitor2.com, competitor3.com"
                value={competitorDomains}
                onChange={(e) => setCompetitorDomains(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter up to 5 competitor domains, separated by commas
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Analysis Queries (Optional)</label>
            <Input
              placeholder="query 1, query 2, query 3 (leave blank to auto-generate)"
              value={analysisQueries}
              onChange={(e) => setAnalysisQueries(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Specific queries to analyze. If empty, we'll generate relevant queries automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Analysis Depth</label>
            <div className="flex gap-3">
              {(['quick', 'standard', 'deep'] as const).map((depth) => (
                <label key={depth} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="depth"
                    value={depth}
                    checked={analysisDepth === depth}
                    onChange={(e) => setAnalysisDepth(e.target.value as 'quick' | 'standard' | 'deep')}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm capitalize">{depth}</span>
                  <span className="text-xs text-gray-500">
                    ({depth === 'quick' ? '5' : depth === 'standard' ? '10' : '15'} queries)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={runGapAnalysis} 
            disabled={loading || !userDomain || !competitorDomains}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Competitors...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Run Competitor Gap Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.competitorAnalyses.length}</div>
                <div className="text-sm text-gray-500">Competitors Analyzed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{results.analysisQueries.length}</div>
                <div className="text-sm text-gray-500">Queries Tested</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getDifficultyColor(results.difficultyScore)}`}>
                  {results.difficultyScore}%
                </div>
                <div className="text-sm text-gray-500">Difficulty Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{results.timeToCompete}</div>
                <div className="text-sm text-gray-500">Est. Time to Compete</div>
              </CardContent>
            </Card>
          </div>

          {/* Competitor Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.competitorAnalyses
                  .sort((a, b) => b.citationCount - a.citationCount)
                  .map((competitor, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{competitor.domain}</h3>
                          <Badge variant={competitor.citationCount > 5 ? "destructive" : competitor.citationCount > 2 ? "default" : "secondary"}>
                            {competitor.citationCount} citations
                          </Badge>
                          {competitor.averagePosition > 0 && (
                            <Badge variant="outline">
                              Avg position: #{Math.round(competitor.averagePosition)}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                            <Target className="w-4 h-4 text-green-500" />
                            Strongest Queries
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {competitor.strongestQueries.slice(0, 3).map((query, i) => (
                              <li key={i} className="truncate">• {query}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                            {getGapIcon('content')}
                            Content Advantages
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {competitor.contentGaps.slice(0, 3).map((gap, i) => (
                              <li key={i} className="truncate">• {gap}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                            {getGapIcon('authority')}
                            Authority Signals
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {competitor.authoritySignals.slice(0, 3).map((signal, i) => (
                              <li key={i} className="truncate">• {signal}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                            {getGapIcon('technical')}
                            Technical Edges
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {competitor.technicalAdvantages.slice(0, 3).map((advantage, i) => (
                              <li key={i} className="truncate">• {advantage}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Strategy:</span> {competitor.contentStrategy}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Gaps */}
          <Card>
            <CardHeader>
              <CardTitle>Key Gaps to Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(results.overallGaps).map(([gapType, gaps]) => (
                  <div key={gapType} className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 capitalize">
                      {getGapIcon(gapType)}
                      {gapType.replace('Gaps', '')} Gaps
                    </h4>
                    <ul className="space-y-2">
                      {(gaps as string[]).slice(0, 5).map((gap, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Actionable Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.actionableRecommendations.map((recommendation, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Priority Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {results.priorityOpportunities.map((opportunity, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Competitor Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((analysis, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{analysis.userDomain}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">
                        vs {analysis.competitorDomains.length} competitors
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.analyzedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {analysis.analysisQueries.length} queries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getDifficultyColor(analysis.difficultyScore)}>
                      {analysis.difficultyScore}% difficulty
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {analysis.timeToCompete}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorGapAnalysis;