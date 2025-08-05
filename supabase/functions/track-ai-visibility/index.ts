import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { domain, user_id, target_queries = [], platforms = [], include_competitive_analysis = false, include_sentiment_analysis = false } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Tracking AI visibility for domain:', domain)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Generate queries if not provided
    const queriesToAnalyze = target_queries.length > 0 
      ? target_queries 
      : generateQueriesFromDomain(domain);

    // Track visibility across each platform
    const platformResults = await Promise.all(
      platforms.map(platform => trackPlatformVisibility(platform, domain, queriesToAnalyze))
    );

    // Calculate overall metrics
    const metrics = calculateVisibilityMetrics(platformResults, domain);

    // Store results in database
    await storeVisibilityResults({
      user_id,
      domain,
      metrics,
      platform_results: platformResults,
      queries: queriesToAnalyze
    }, supabaseUrl, supabaseKey);

    return new Response(
      JSON.stringify({
        success: true,
        metrics,
        queries_analyzed: queriesToAnalyze.length,
        platforms_tracked: platforms.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in track-ai-visibility:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateQueriesFromDomain(domain: string): string[] {
  // Extract business context from domain
  const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  
  const baseQueries = [
    `what is ${domainName}`,
    `${domainName} reviews`,
    `${domainName} features`,
    `how to use ${domainName}`,
    `${domainName} vs competitors`,
    `${domainName} pricing`,
    `${domainName} benefits`,
    `best ${domainName} alternative`,
    `${domainName} tutorial`,
    `${domainName} problems`
  ];

  // Industry-specific queries based on domain patterns
  if (domain.includes('saas') || domain.includes('software') || domain.includes('app')) {
    baseQueries.push(
      `${domainName} integration`,
      `${domainName} API`,
      `${domainName} security`,
      `${domainName} enterprise`
    );
  }

  if (domain.includes('ecommerce') || domain.includes('shop') || domain.includes('store')) {
    baseQueries.push(
      `${domainName} products`,
      `${domainName} shipping`,
      `${domainName} return policy`,
      `${domainName} deals`
    );
  }

  return baseQueries;
}

async function trackPlatformVisibility(platform: string, domain: string, queries: string[]) {
  const platformData = {
    platform,
    citationRate: 0,
    averagePosition: 0,
    mentionFrequency: 0,
    sentiment: 'neutral' as 'positive' | 'neutral' | 'negative',
    crawlFrequency: 0,
    lastCrawled: new Date().toISOString(),
    competitorShare: 0,
    trending: 'stable' as 'up' | 'down' | 'stable'
  };

  let totalCitations = 0;
  let totalPositions = 0;
  let positionCount = 0;

  try {
    // Check a sample of queries for this platform
    for (const query of queries.slice(0, 5)) {
      const result = await simulatePlatformQuery(platform, query, domain);
      
      if (result.cited) {
        totalCitations++;
        totalPositions += result.position;
        positionCount++;
      }
    }

    // Calculate metrics
    platformData.citationRate = Math.round((totalCitations / Math.min(queries.length, 5)) * 100);
    platformData.averagePosition = positionCount > 0 ? Math.round(totalPositions / positionCount) : 0;
    platformData.mentionFrequency = Math.round(Math.random() * 10) + 1; // Simulated weekly mentions
    platformData.crawlFrequency = Math.min(100, platformData.citationRate + Math.round(Math.random() * 20));
    platformData.competitorShare = Math.round(Math.random() * 30) + 10; // 10-40% market share
    
    // Determine sentiment based on citation rate
    if (platformData.citationRate > 70) {
      platformData.sentiment = 'positive';
    } else if (platformData.citationRate < 30) {
      platformData.sentiment = 'negative';
    }

    // Determine trending based on random simulation (would be based on historical data in real implementation)
    const trendValue = Math.random();
    if (trendValue > 0.6) platformData.trending = 'up';
    else if (trendValue < 0.4) platformData.trending = 'down';

  } catch (error) {
    console.error(`Error tracking ${platform}:`, error);
  }

  return platformData;
}

async function simulatePlatformQuery(platform: string, query: string, domain: string) {
  // Simulate platform-specific query analysis
  // In a real implementation, this would use actual APIs or scraping
  
  const domainAuthority = getDomainAuthority(domain);
  const queryComplexity = query.split(' ').length > 5 ? 0.6 : 0.4;
  
  // Platform-specific citation probabilities
  const platformMultipliers = {
    'chatgpt': 0.8,
    'perplexity': 0.9,
    'gemini': 0.7,
    'claude': 0.75,
    'copilot': 0.6
  };

  const baseProb = Math.min(0.9, domainAuthority + queryComplexity * 0.3);
  const platformProb = baseProb * (platformMultipliers[platform] || 0.7);
  
  const cited = Math.random() < platformProb;
  const position = cited ? Math.floor(Math.random() * 5) + 1 : 0;

  return { cited, position };
}

function getDomainAuthority(domain: string): number {
  // Simulate domain authority based on domain characteristics
  if (domain.includes('.gov')) return 0.9;
  if (domain.includes('.edu')) return 0.8;
  if (domain.includes('.org')) return 0.6;
  if (domain.length < 10) return 0.4; // Short domains often have higher authority
  return 0.5;
}

function calculateVisibilityMetrics(platformResults: any[], domain: string) {
  const totalPlatforms = platformResults.length;
  
  // Calculate overall score
  const avgCitationRate = platformResults.reduce((sum, p) => sum + p.citationRate, 0) / totalPlatforms;
  const avgPosition = platformResults.filter(p => p.averagePosition > 0).reduce((sum, p) => sum + (10 - p.averagePosition), 0) / totalPlatforms;
  const overallScore = Math.round((avgCitationRate + avgPosition * 2) / 3);

  // Calculate authority score based on multiple factors
  const authorityScore = Math.round(
    (avgCitationRate * 0.4) + 
    (avgPosition * 0.3) + 
    (getDomainAuthority(domain) * 100 * 0.3)
  );

  // Calculate content optimization score
  const contentOptimization = Math.round(
    platformResults.reduce((sum, p) => sum + p.crawlFrequency, 0) / totalPlatforms
  );

  // Generate recommendations
  const recommendations = generateRecommendations(platformResults, overallScore);

  return {
    overallScore,
    citationPotential: avgCitationRate,
    authorityScore,
    contentOptimization,
    platforms: platformResults,
    recommendations,
    lastAnalyzed: new Date().toISOString()
  };
}

function generateRecommendations(platformResults: any[], overallScore: number): string[] {
  const recommendations: string[] = [];

  if (overallScore < 50) {
    recommendations.push("Improve content structure with clear headings and FAQ sections to increase AI citation potential");
    recommendations.push("Implement comprehensive schema markup (Article, FAQ, Organization) to help AI systems understand your content");
  }

  const lowPerformingPlatforms = platformResults.filter(p => p.citationRate < 30);
  if (lowPerformingPlatforms.length > 0) {
    recommendations.push(`Focus optimization efforts on ${lowPerformingPlatforms.map(p => p.platform).join(', ')} - these platforms show low citation rates`);
  }

  const avgPosition = platformResults.reduce((sum, p) => sum + p.averagePosition, 0) / platformResults.length;
  if (avgPosition > 3) {
    recommendations.push("Create more authoritative, comprehensive content to improve citation positioning in AI responses");
  }

  if (platformResults.some(p => p.crawlFrequency < 50)) {
    recommendations.push("Optimize technical SEO (page speed, mobile responsiveness, clean HTML) to improve AI crawler accessibility");
  }

  recommendations.push("Regularly update content with latest information and industry insights to maintain AI platform relevance");
  recommendations.push("Build topical authority by creating content clusters around your core expertise areas");

  return recommendations;
}

async function storeVisibilityResults(data: any, supabaseUrl: string, supabaseKey: string) {
  try {
    await fetch(`${supabaseUrl}/rest/v1/ai_visibility_tracking`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        domain: data.domain,
        overall_score: data.metrics.overallScore,
        citation_potential: data.metrics.citationPotential,
        authority_score: data.metrics.authorityScore,
        content_optimization: data.metrics.contentOptimization,
        platform_results: data.platform_results,
        queries_analyzed: data.queries,
        recommendations: data.metrics.recommendations,
        analyzed_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store visibility results:', error);
  }
}