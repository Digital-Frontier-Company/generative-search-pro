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
  Target, 
  TrendingUp, 
  Clock, 
  Zap, 
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3
} from 'lucide-react';

interface OpportunityResult {
  query: string;
  domain: string;
  currentRanking: number | null;
  citationProbability: number;
  contentGaps: string[];
  competitorAdvantages: string[];
  optimizationActions: string[];
  timeToRank: string;
  difficultyScore: number;
}

interface ScanResults {
  domain: string;
  opportunities: OpportunityResult[];
  totalOpportunities: number;
  highPotentialCount: number;
  averageDifficulty: number;
  estimatedTimeToResults: string;
  scannedAt: string;
}

const OpportunityScanner = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [domain, setDomain] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [targetQueries, setTargetQueries] = useState('');
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResults | null>(null);
  const [history, setHistory] = useState<ScanResults[]>([]);

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('opportunity_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      // Map database columns to expected interface
      const mappedData = (data || []).map(item => ({
        domain: item.domain,
        opportunities: [], // Empty array as we'll load this separately
        totalOpportunities: item.total_opportunities,
        highPotentialCount: item.high_potential_count,
        averageDifficulty: Math.round((item.high_potential_count + item.medium_potential_count + item.low_potential_count) / 3 * 30), // Estimated
        estimatedTimeToResults: '2-4 weeks', // Default value
        scannedAt: item.created_at
      }));
      
      setHistory(mappedData);
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const runOpportunityScanner = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to run opportunity scanner');
        return;
      }

      const { data, error } = await supabase.functions.invoke('citation-opportunity-scanner', {
        body: JSON.stringify({
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          content_url: contentUrl || undefined,
          target_queries: targetQueries || undefined,
          analysis_depth: analysisDepth
        })
      });

      if (error) throw error;

      setResults(data);
      loadHistory();

      const highPotential = data.highPotentialCount;
      if (highPotential > 0) {
        toast.success(`Found ${highPotential} high-potential citation opportunities!`);
      } else {
        toast.info(`Scan complete. Found ${data.totalOpportunities} opportunities to analyze.`);
      }

    } catch (error: unknown) {
      console.error('Opportunity scanner error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to run opportunity scanner';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-50';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 40) return 'text-green-600';
    if (difficulty <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankingBadge = (ranking: number | null) => {
    if (!ranking) return <Badge variant="destructive">Not Ranked</Badge>;
    if (ranking <= 3) return <Badge variant="default">#{ranking}</Badge>;
    if (ranking <= 10) return <Badge variant="secondary">#{ranking}</Badge>;
    return <Badge variant="outline">#{ranking}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Citation Opportunity Scanner</h1>
        <p className="text-gray-600">
          AI-powered analysis to find the best citation opportunities for your content
        </p>
      </div>

      {/* Scanner Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Opportunity Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domain *</label>
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content URL (Optional)</label>
              <Input
                placeholder="https://example.com/page"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Target Queries (Optional)</label>
            <Input
              placeholder="how to, what is, best practices (comma-separated)"
              value={targetQueries}
              onChange={(e) => setTargetQueries(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave blank to auto-generate queries based on your domain
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
                    ({depth === 'quick' ? '5' : depth === 'standard' ? '10' : '20'} queries)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            onClick={runOpportunityScanner} 
            disabled={loading || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning Opportunities...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Scan Citation Opportunities
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{results.totalOpportunities}</div>
                <div className="text-sm text-gray-500">Total Opportunities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{results.highPotentialCount}</div>
                <div className="text-sm text-gray-500">High Potential</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(results.averageDifficulty)}%</div>
                <div className="text-sm text-gray-500">Avg Difficulty</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{results.estimatedTimeToResults}</div>
                <div className="text-sm text-gray-500">Est. Time to Results</div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Citation Opportunities</span>
                <Badge variant="outline">{results.opportunities.length} found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.opportunities.map((opportunity, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">"{opportunity.query}"</h3>
                        <div className="flex items-center gap-3 mt-1">
                          {getRankingBadge(opportunity.currentRanking)}
                          <Badge className={getProbabilityColor(opportunity.citationProbability)}>
                            {opportunity.citationProbability}% Citation Probability
                          </Badge>
                          <span className={`text-sm font-medium ${getDifficultyColor(opportunity.difficultyScore)}`}>
                            Difficulty: {opportunity.difficultyScore}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {opportunity.timeToRank}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          Content Gaps
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {opportunity.contentGaps.slice(0, 3).map((gap, i) => (
                            <li key={i}>• {gap}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          Competitor Advantages
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {opportunity.competitorAdvantages.slice(0, 3).map((advantage, i) => (
                            <li key={i}>• {advantage}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Optimization Actions
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {opportunity.optimizationActions.slice(0, 3).map((action, i) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Opportunity Score: {Math.round(opportunity.citationProbability * (100 - opportunity.difficultyScore) / 100)}/100
                        </span>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4 mr-1" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Scans */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Opportunity Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((scan, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{scan.domain}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(scan.scannedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {scan.totalOpportunities} opportunities
                      </p>
                      <p className="text-xs text-gray-500">
                        {scan.highPotentialCount} high potential
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {Math.round(scan.averageDifficulty)}% difficulty
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {scan.estimatedTimeToResults}
                    </span>
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

export default OpportunityScanner;