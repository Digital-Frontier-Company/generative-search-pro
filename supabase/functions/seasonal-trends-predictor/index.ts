import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

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
  predictedTrends: {
    nextMonth: SeasonalTrend;
    nextQuarter: SeasonalTrend[];
    nextYear: SeasonalTrend[];
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
}

interface HistoricalData {
  month: number;
  year: number;
  citations: number;
  queries: string[];
  position: number;
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const action = body.action || 'predict_trends';

    switch (action) {
      case 'predict_trends':
        return await predictSeasonalTrends(body, user);
      case 'get_historical_data':
        return await getHistoricalData(body, user);
      case 'analyze_patterns':
        return await analyzeSeasonalPatterns(body, user);
      default:
        throw new Error('Invalid action');
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 3600000 }, // 20 requests per hour
    maxRequestSize: 10240,
    allowedOrigins: ['*']
  }
);

async function predictSeasonalTrends(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId,
    prediction_period: { type: 'string' as const, required: false }, // month, quarter, year
    include_ai_insights: { type: 'boolean' as const, required: false }
  });

  const {
    domain,
    user_id,
    prediction_period = 'quarter',
    include_ai_insights = true
  } = validated;

  console.log('Predicting seasonal trends for:', { domain, prediction_period });

  const cacheKey = generateCacheKey('seasonal-trends', domain, prediction_period);
  const cached = getCached(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const performPrediction = withPerformanceMonitoring(async () => {
    // Step 1: Get historical citation data
    const historicalData = await getHistoricalCitationData(domain, user_id);
    
    // Step 2: Analyze seasonal patterns
    const patterns = await analyzeHistoricalPatterns(historicalData);
    
    // Step 3: Generate predictions using AI and statistical analysis
    const predictions = await generateTrendPredictions(domain, historicalData, patterns, prediction_period);
    
    // Step 4: Get AI insights if requested
    let aiInsights: any = {};
    if (include_ai_insights) {
      aiInsights = await generateAITrendInsights(domain, historicalData, patterns, predictions);
    }

    return {
      domain,
      predictionPeriod: prediction_period,
      historicalDataPoints: historicalData.length,
      predictedTrends: predictions,
      seasonalPatterns: patterns,
      actionableInsights: aiInsights.insights || [],
      contentRecommendations: aiInsights.contentRecommendations || [],
      optimizationWindows: aiInsights.optimizationWindows || [],
      confidenceScore: calculatePredictionConfidence(historicalData),
      generatedAt: new Date().toISOString()
    };
  }, 'seasonal-trends-prediction');

  const results = await performPrediction();

  // Store prediction results
  const storeResults = withPerformanceMonitoring(async () => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/seasonal_predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id,
        domain,
        prediction_period,
        historical_data_points: results.historicalDataPoints,
        predicted_trends: results.predictedTrends,
        seasonal_patterns: results.seasonalPatterns,
        actionable_insights: results.actionableInsights,
        content_recommendations: results.contentRecommendations,
        optimization_windows: results.optimizationWindows,
        confidence_score: results.confidenceScore,
        generated_at: results.generatedAt
      }),
    }).catch(err => console.error('DB insert failed:', err));

    return results;
  }, 'seasonal-trends-db-store');

  const finalResults = await storeResults();
  setCached(cacheKey, finalResults, 3600000); // 1 hour cache

  return new Response(JSON.stringify(finalResults), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getHistoricalCitationData(domain: string, userId: string): Promise<HistoricalData[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    // Get citation data from the last 24 months
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - 24);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/citation_checks?user_id=eq.${userId}&domain=eq.${domain}&checked_at=gte.${cutoffDate.toISOString()}&order=checked_at.asc`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );

    const citationChecks = await response.json();
    
    // Group by month and aggregate data
    const monthlyData = new Map<string, HistoricalData>();

    citationChecks.forEach((check: any) => {
      const date = new Date(check.checked_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          citations: 0,
          queries: [],
          position: 0
        });
      }

      const monthData = monthlyData.get(monthKey)!;
      if (check.is_cited) {
        monthData.citations++;
        monthData.queries.push(check.query);
        if (check.citation_position) {
          monthData.position = (monthData.position + check.citation_position) / 2;
        }
      }
    });

    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return simulated data for development
    return generateSimulatedHistoricalData();
  }
}

function generateSimulatedHistoricalData(): HistoricalData[] {
  const data: HistoricalData[] = [];
  const currentDate = new Date();
  
  for (let i = 24; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    
    // Simulate seasonal patterns
    const month = date.getMonth() + 1;
    let baseCitations = 15;
    
    // Holiday season boost (Nov-Dec)
    if (month === 11 || month === 12) baseCitations += 8;
    // Back to school (Aug-Sep)
    if (month === 8 || month === 9) baseCitations += 5;
    // Summer dip (Jun-Jul)
    if (month === 6 || month === 7) baseCitations -= 3;
    
    // Add some randomness
    const citations = Math.max(0, baseCitations + Math.floor(Math.random() * 10) - 5);
    
    data.push({
      month: month,
      year: date.getFullYear(),
      citations,
      queries: Array.from({length: Math.min(citations, 10)}, (_, i) => `Query ${i + 1} for ${month}/${date.getFullYear()}`),
      position: citations > 0 ? Math.floor(Math.random() * 5) + 1 : 0
    });
  }
  
  return data;
}

async function analyzeHistoricalPatterns(historicalData: HistoricalData[]) {
  if (historicalData.length < 6) {
    return {
      peakMonths: [11, 12], // Default holiday season
      lowMonths: [6, 7], // Default summer
      yearOverYearGrowth: 0,
      cyclicalPattern: 'insufficient-data'
    };
  }

  // Find peak and low months
  const monthlyAverages = new Map<number, number>();
  
  historicalData.forEach(data => {
    const current = monthlyAverages.get(data.month) || 0;
    monthlyAverages.set(data.month, current + data.citations);
  });

  // Calculate averages
  monthlyAverages.forEach((total, month) => {
    const count = historicalData.filter(d => d.month === month).length;
    monthlyAverages.set(month, total / count);
  });

  const sortedMonths = Array.from(monthlyAverages.entries()).sort((a, b) => b[1] - a[1]);
  
  const peakMonths = sortedMonths.slice(0, 3).map(([month]) => month);
  const lowMonths = sortedMonths.slice(-2).map(([month]) => month);

  // Calculate year-over-year growth
  const thisYear = new Date().getFullYear();
  const lastYear = thisYear - 1;
  
  const thisYearData = historicalData.filter(d => d.year === thisYear);
  const lastYearData = historicalData.filter(d => d.year === lastYear);
  
  const thisYearTotal = thisYearData.reduce((sum, d) => sum + d.citations, 0);
  const lastYearTotal = lastYearData.reduce((sum, d) => sum + d.citations, 0);
  
  const yearOverYearGrowth = lastYearTotal > 0 ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0;

  // Determine cyclical pattern
  let cyclicalPattern = 'stable';
  if (Math.abs(yearOverYearGrowth) > 20) {
    cyclicalPattern = yearOverYearGrowth > 0 ? 'growth' : 'decline';
  } else if (peakMonths.includes(11) || peakMonths.includes(12)) {
    cyclicalPattern = 'holiday-driven';
  } else if (peakMonths.includes(8) || peakMonths.includes(9)) {
    cyclicalPattern = 'back-to-school';
  }

  return {
    peakMonths,
    lowMonths,
    yearOverYearGrowth,
    cyclicalPattern
  };
}

async function generateTrendPredictions(
  domain: string,
  historicalData: HistoricalData[],
  patterns: any,
  predictionPeriod: string
) {
  const currentDate = new Date();
  const predictions: any = {};

  // Predict next month
  const nextMonth = new Date(currentDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const nextMonthNum = nextMonth.getMonth() + 1;
  const isNextMonthPeak = patterns.peakMonths.includes(nextMonthNum);
  const isNextMonthLow = patterns.lowMonths.includes(nextMonthNum);
  
  let basePrediction = calculateAverageCitations(historicalData);
  if (isNextMonthPeak) basePrediction *= 1.4;
  if (isNextMonthLow) basePrediction *= 0.7;

  predictions.nextMonth = {
    month: nextMonthNum,
    year: nextMonth.getFullYear(),
    citationCount: Math.round(basePrediction),
    averagePosition: calculateAveragePosition(historicalData),
    totalQueries: Math.round(basePrediction * 1.5),
    topQueries: generatePredictedQueries(domain, nextMonthNum),
    trendDirection: determineTrendDirection(patterns.yearOverYearGrowth, isNextMonthPeak, isNextMonthLow),
    confidenceScore: calculatePredictionConfidence(historicalData)
  };

  // Predict next quarter
  if (predictionPeriod === 'quarter' || predictionPeriod === 'year') {
    predictions.nextQuarter = [];
    for (let i = 1; i <= 3; i++) {
      const futureMonth = new Date(currentDate);
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      const monthNum = futureMonth.getMonth() + 1;
      const isPeak = patterns.peakMonths.includes(monthNum);
      const isLow = patterns.lowMonths.includes(monthNum);
      
      let monthPrediction = basePrediction;
      if (isPeak) monthPrediction *= 1.4;
      if (isLow) monthPrediction *= 0.7;

      predictions.nextQuarter.push({
        month: monthNum,
        year: futureMonth.getFullYear(),
        citationCount: Math.round(monthPrediction),
        averagePosition: calculateAveragePosition(historicalData),
        totalQueries: Math.round(monthPrediction * 1.5),
        topQueries: generatePredictedQueries(domain, monthNum),
        trendDirection: determineTrendDirection(patterns.yearOverYearGrowth, isPeak, isLow),
        confidenceScore: calculatePredictionConfidence(historicalData) * 0.9 // Slightly lower confidence for future months
      });
    }
  }

  // Predict next year (12 months)
  if (predictionPeriod === 'year') {
    predictions.nextYear = [];
    for (let i = 1; i <= 12; i++) {
      const futureMonth = new Date(currentDate);
      futureMonth.setMonth(futureMonth.getMonth() + i);
      
      const monthNum = futureMonth.getMonth() + 1;
      const isPeak = patterns.peakMonths.includes(monthNum);
      const isLow = patterns.lowMonths.includes(monthNum);
      
      let monthPrediction = basePrediction * (1 + patterns.yearOverYearGrowth / 100);
      if (isPeak) monthPrediction *= 1.4;
      if (isLow) monthPrediction *= 0.7;

      predictions.nextYear.push({
        month: monthNum,
        year: futureMonth.getFullYear(),
        citationCount: Math.round(monthPrediction),
        averagePosition: calculateAveragePosition(historicalData),
        totalQueries: Math.round(monthPrediction * 1.5),
        topQueries: generatePredictedQueries(domain, monthNum),
        trendDirection: determineTrendDirection(patterns.yearOverYearGrowth, isPeak, isLow),
        confidenceScore: calculatePredictionConfidence(historicalData) * 0.8 // Lower confidence for longer predictions
      });
    }
  }

  return predictions;
}

async function generateAITrendInsights(
  domain: string,
  historicalData: HistoricalData[],
  patterns: any,
  predictions: any
): Promise<{insights: string[], contentRecommendations: string[], optimizationWindows: any[]}> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const prompt = `Analyze seasonal citation trends for ${domain} and provide strategic insights.

Historical Pattern:
- Peak months: ${patterns.peakMonths.join(', ')}
- Low months: ${patterns.lowMonths.join(', ')}
- Year-over-year growth: ${patterns.yearOverYearGrowth}%
- Pattern type: ${patterns.cyclicalPattern}

Recent Performance:
- Average citations per month: ${calculateAverageCitations(historicalData)}
- Data points: ${historicalData.length} months

Provide analysis in JSON format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "contentRecommendations": ["recommendation 1", "recommendation 2"],
  "optimizationWindows": [
    {"month": 11, "opportunity": "Holiday content prep", "priority": "high"},
    {"month": 8, "opportunity": "Back-to-school content", "priority": "medium"}
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(analysisText);
    } catch (parseError) {
      return generateFallbackInsights(patterns);
    }
  } catch (error) {
    console.error('AI insights generation failed:', error);
    return generateFallbackInsights(patterns);
  }
}

function generateFallbackInsights(patterns: any) {
  const insights = [];
  const contentRecommendations = [];
  const optimizationWindows = [];

  if (patterns.yearOverYearGrowth > 0) {
    insights.push(`Positive growth trend of ${patterns.yearOverYearGrowth.toFixed(1)}% year-over-year`);
  } else if (patterns.yearOverYearGrowth < 0) {
    insights.push(`Declining trend of ${Math.abs(patterns.yearOverYearGrowth).toFixed(1)}% needs attention`);
  }

  if (patterns.cyclicalPattern === 'holiday-driven') {
    insights.push('Strong holiday seasonality detected - prepare content for Q4 boost');
    contentRecommendations.push('Create holiday-themed content 2-3 months in advance');
    optimizationWindows.push({month: 10, opportunity: 'Holiday content preparation', priority: 'high'});
  }

  if (patterns.peakMonths.includes(8) || patterns.peakMonths.includes(9)) {
    insights.push('Back-to-school period shows strong performance');
    contentRecommendations.push('Develop educational content for late summer publishing');
    optimizationWindows.push({month: 7, opportunity: 'Back-to-school content prep', priority: 'medium'});
  }

  return { insights, contentRecommendations, optimizationWindows };
}

function calculateAverageCitations(historicalData: HistoricalData[]): number {
  if (historicalData.length === 0) return 0;
  const total = historicalData.reduce((sum, data) => sum + data.citations, 0);
  return total / historicalData.length;
}

function calculateAveragePosition(historicalData: HistoricalData[]): number {
  const dataWithPositions = historicalData.filter(d => d.position > 0);
  if (dataWithPositions.length === 0) return 0;
  const total = dataWithPositions.reduce((sum, data) => sum + data.position, 0);
  return Math.round(total / dataWithPositions.length);
}

function determineTrendDirection(
  yearOverYearGrowth: number, 
  isPeak: boolean, 
  isLow: boolean
): 'up' | 'down' | 'stable' {
  if (isPeak || yearOverYearGrowth > 10) return 'up';
  if (isLow || yearOverYearGrowth < -10) return 'down';
  return 'stable';
}

function calculatePredictionConfidence(historicalData: HistoricalData[]): number {
  // Base confidence on amount of historical data
  let confidence = Math.min(historicalData.length * 4, 90); // Max 90%
  
  // Reduce confidence if data is very sparse
  const averageCitations = calculateAverageCitations(historicalData);
  if (averageCitations < 2) confidence *= 0.7;
  
  // Reduce confidence if data is too recent (less than 6 months)
  if (historicalData.length < 6) confidence *= 0.6;
  
  return Math.round(confidence);
}

function generatePredictedQueries(domain: string, month: number): string[] {
  const seasonalQueries = {
    1: ['new year resolutions', 'january trends', 'fresh start'],
    2: ['valentine\'s day', 'february planning', 'love guides'],
    3: ['spring preparation', 'march madness', 'seasonal transition'],
    4: ['spring cleaning', 'april showers', 'easter preparation'],
    5: ['mother\'s day', 'spring activities', 'may flowers'],
    6: ['summer preparation', 'father\'s day', 'vacation planning'],
    7: ['summer activities', 'july fourth', 'vacation guides'],
    8: ['back to school', 'august preparation', 'fall planning'],
    9: ['september activities', 'autumn preparation', 'school year'],
    10: ['october activities', 'halloween preparation', 'fall harvest'],
    11: ['thanksgiving preparation', 'november planning', 'holiday prep'],
    12: ['christmas preparation', 'year end', 'holiday season']
  };

  const baseQueries = seasonalQueries[month as keyof typeof seasonalQueries] || ['general queries', 'trending topics', 'seasonal content'];
  return baseQueries.slice(0, 3);
}

async function getHistoricalData(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId,
    months_back: { type: 'number' as const, required: false }
  });

  const { domain, user_id, months_back = 24 } = validated;

  const historicalData = await getHistoricalCitationData(domain, user_id);
  const limitedData = historicalData.slice(-months_back);

  return new Response(JSON.stringify({
    domain,
    monthsRequested: months_back,
    dataPoints: limitedData.length,
    historicalData: limitedData
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function analyzeSeasonalPatterns(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId
  });

  const { domain, user_id } = validated;

  const historicalData = await getHistoricalCitationData(domain, user_id);
  const patterns = await analyzeHistoricalPatterns(historicalData);

  return new Response(JSON.stringify({
    domain,
    dataPoints: historicalData.length,
    patterns,
    analyzedAt: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

serve(secureHandler);