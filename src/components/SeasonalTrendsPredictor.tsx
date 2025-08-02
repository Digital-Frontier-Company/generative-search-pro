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
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Target,
  Clock,
  Zap,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface SeasonalTrend {
  month: number;
  year: number;
  citationCount: number;
  averagePosition: number;
  totalQueries: number;
  topQueries: string[];
  trendDirection: 'up' | 'down' | 'stable';
  confidenceScore: number;
}

interface TrendPrediction {
  domain: string;
  predictionPeriod: string;
  historicalDataPoints: number;
  predictedTrends: {
    nextMonth?: SeasonalTrend;
    nextQuarter?: SeasonalTrend[];
    nextYear?: SeasonalTrend[];
  };
  seasonalPatterns: {
    peakMonths: number[];
    lowMonths: number[];
    yearOverYearGrowth: number;
    cyclicalPattern: string;
  };
  actionableInsights: string[];
  contentRecommendations: string[];
  optimizationWindows: {
    month: number;
    opportunity: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  confidenceScore: number;
  generatedAt: string;
}

const SeasonalTrendsPredictor = () => {
  const { defaultDomain } = useDomain();
  const { user } = useAuth();
  const [domain, setDomain] = useState('');
  const [predictionPeriod, setPredictionPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [includeAIInsights, setIncludeAIInsights] = useState(true);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<TrendPrediction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  useEffect(() => {
    if (defaultDomain && !domain) {
      setDomain(defaultDomain);
    }
  }, [defaultDomain, domain]);

  const generatePredictions = async () => {
    if (!domain) {
      toast.error('Please enter a domain');
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please sign in to generate predictions');
        return;
      }

      const { data, error } = await supabase.functions.invoke('seasonal-trends-predictor', {
        body: JSON.stringify({
          action: 'predict_trends',
          domain: domain.replace(/^https?:\/\//, ''),
          user_id: user.id,
          prediction_period: predictionPeriod,
          include_ai_insights: includeAIInsights
        })
      });

      if (error) throw error;

      setPredictions(data);
      
      const nextMonthCitations = data.predictedTrends.nextMonth?.citationCount || 0;
      const direction = data.seasonalPatterns.yearOverYearGrowth > 0 ? 'growth' : 'decline';
      
      toast.success(`Predictions generated! Forecasting ${nextMonthCitations} citations next month with ${direction} trend`);

    } catch (error: unknown) {
      console.error('Prediction error:', error);
      const errMessage = error instanceof Error ? error.message : 'Failed to generate predictions';
      toast.error(errMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1] || 'Unknown';
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      case 'stable': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCyclicalPatternDescription = (pattern: string) => {
    switch (pattern) {
      case 'holiday-driven': return 'Strong holiday seasonality with Q4 peaks';
      case 'back-to-school': return 'Education-focused with late summer peaks';
      case 'growth': return 'Consistent upward trajectory';
      case 'decline': return 'Declining trend requiring attention';
      case 'stable': return 'Stable performance with minor fluctuations';
      default: return 'Insufficient data for pattern recognition';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seasonal Citation Trends Predictor</h1>
        <p className="text-gray-600">
          Forecast your citation performance using AI-powered seasonal analysis and historical data patterns
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Generate Seasonal Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Domain *</label>
              <Input
                placeholder="yourdomain.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prediction Period</label>
              <div className="flex gap-3">
                {(['month', 'quarter', 'year'] as const).map((period) => (
                  <label key={period} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="period"
                      value={period}
                      checked={predictionPeriod === period}
                      onChange={(e) => setPredictionPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{period}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAIInsights}
                onChange={(e) => setIncludeAIInsights(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Include AI-powered insights and recommendations</span>
            </label>
          </div>

          <Button 
            onClick={generatePredictions} 
            disabled={loading || !domain}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Predictions...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Seasonal Predictions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {predictions && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{predictions.historicalDataPoints}</div>
                <div className="text-sm text-gray-500">Data Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getConfidenceColor(predictions.confidenceScore)}`}>
                  {predictions.confidenceScore}%
                </div>
                <div className="text-sm text-gray-500">Confidence</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${predictions.seasonalPatterns.yearOverYearGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {predictions.seasonalPatterns.yearOverYearGrowth > 0 ? '+' : ''}{predictions.seasonalPatterns.yearOverYearGrowth.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">YoY Growth</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {predictions.predictedTrends.nextMonth?.citationCount || 0}
                </div>
                <div className="text-sm text-gray-500">Next Month</div>
              </CardContent>
            </Card>
          </div>

          {/* Seasonal Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Patterns Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Peak Months</h4>
                  <div className="flex flex-wrap gap-2">
                    {predictions.seasonalPatterns.peakMonths.map(month => (
                      <Badge key={month} className="bg-green-100 text-green-800">
                        {getMonthName(month)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Low Performance</h4>
                  <div className="flex flex-wrap gap-2">
                    {predictions.seasonalPatterns.lowMonths.map(month => (
                      <Badge key={month} variant="outline" className="text-red-600">
                        {getMonthName(month)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Pattern Type</h4>
                  <p className="text-sm text-gray-600">
                    {getCyclicalPatternDescription(predictions.seasonalPatterns.cyclicalPattern)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictions Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Next Month */}
              {predictions.predictedTrends.nextMonth && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Next Month Prediction</h4>
                  <div className={`border rounded-lg p-4 ${getTrendColor(predictions.predictedTrends.nextMonth.trendDirection)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">
                          {getMonthName(predictions.predictedTrends.nextMonth.month)} {predictions.predictedTrends.nextMonth.year}
                        </h5>
                        {getTrendIcon(predictions.predictedTrends.nextMonth.trendDirection)}
                      </div>
                      <Badge variant="outline">
                        {predictions.predictedTrends.nextMonth.confidenceScore}% confidence
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{predictions.predictedTrends.nextMonth.citationCount}</div>
                        <div className="text-sm opacity-75">Citations</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">#{predictions.predictedTrends.nextMonth.averagePosition}</div>
                        <div className="text-sm opacity-75">Avg Position</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{predictions.predictedTrends.nextMonth.totalQueries}</div>
                        <div className="text-sm opacity-75">Total Queries</div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <strong>Top Queries:</strong>
                          <ul className="mt-1">
                            {predictions.predictedTrends.nextMonth.topQueries.slice(0, 2).map((query, i) => (
                              <li key={i} className="truncate">• {query}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quarterly/Yearly View */}
              {(predictions.predictedTrends.nextQuarter || predictions.predictedTrends.nextYear) && (
                <div>
                  <h4 className="font-medium mb-3">
                    {predictionPeriod === 'year' ? 'Next 12 Months' : 'Next Quarter'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(predictions.predictedTrends.nextYear || predictions.predictedTrends.nextQuarter || []).map((trend, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedMonth === trend.month ? 'ring-2 ring-blue-500' : ''
                        } ${getTrendColor(trend.trendDirection)}`}
                        onClick={() => setSelectedMonth(selectedMonth === trend.month ? null : trend.month)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{getMonthName(trend.month)} {trend.year}</h5>
                          {getTrendIcon(trend.trendDirection)}
                        </div>
                        <div className="text-lg font-bold">{trend.citationCount} citations</div>
                        <div className="text-sm opacity-75">#{trend.averagePosition} avg position</div>
                        {selectedMonth === trend.month && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-xs">
                              <strong>Predicted Queries:</strong>
                              <ul className="mt-1">
                                {trend.topQueries.map((query, i) => (
                                  <li key={i}>• {query}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights & Recommendations */}
          {(predictions.actionableInsights.length > 0 || predictions.contentRecommendations.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actionable Insights */}
              {predictions.actionableInsights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Actionable Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {predictions.actionableInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                          <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Content Recommendations */}
              {predictions.contentRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Content Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {predictions.contentRecommendations.map((recommendation, i) => (
                        <li key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Optimization Windows */}
          {predictions.optimizationWindows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Optimization Windows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predictions.optimizationWindows.map((window, i) => (
                    <div key={i} className={`border rounded-lg p-4 ${getPriorityColor(window.priority)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{getMonthName(window.month)}</h4>
                        <Badge variant="outline" className={getPriorityColor(window.priority)}>
                          {window.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm">{window.opportunity}</p>
                      <div className="flex items-center justify-end mt-2">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default SeasonalTrendsPredictor;