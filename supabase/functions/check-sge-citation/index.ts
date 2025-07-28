
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

// Validate required environment variables on startup
validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    // Validate and sanitize input
    const body = await req.json();
    const validated = validateInput(body, {
      query: { ...commonSchemas.query, maxLength: 500 },
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      include_competitor_analysis: { type: 'string' as const, required: false },
      include_improvement_suggestions: { type: 'string' as const, required: false }
    });

    const { 
      query, 
      domain, 
      user_id, 
      include_competitor_analysis = false,
      include_improvement_suggestions = false 
    } = validated;

    console.log('Checking SGE citation for:', { query, domain });

    // Generate cache key for this request
    const cacheKey = generateCacheKey('sge-citation', domain, query, include_competitor_analysis, include_improvement_suggestions);
    
    // Check cache first (5 minute TTL)
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('Returning cached result');
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perform the citation check with performance monitoring
    const performCheck = withPerformanceMonitoring(async () => {
      const serpApiKey = Deno.env.get('SERPAPI_KEY');
      
      if (!serpApiKey) {
        throw new Error('SerpApi key not configured. Please add SERPAPI_KEY to your environment variables.');
      }

      const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&gl=us&hl=en`;
      
      // Use retry with exponential backoff for external API calls
      const serpData = await retryWithBackoff(async () => {
        const response = await fetch(serpApiUrl);
        if (!response.ok) {
          throw new Error(`SerpApi request failed: ${response.status}`);
        }
        return response.json();
      }, 3, 1000, 5000);

      // Initialize result variables
      let isCited = false;
      let aiAnswer = '';
      let citedSources: any[] = [];
      let recommendations = '';
      let confidenceScore = 0;
      let competitorAnalysis: any[] = [];
      let citationPosition: number | null = null;
      let totalSources = 0;
      let queryComplexity = 'medium';
      let improvementAreas: string[] = [];

      // Process AI overview if available
      if (serpData.ai_overview) {
        aiAnswer = serpData.ai_overview.overview || '';
        citedSources = serpData.ai_overview.sources || [];
        totalSources = citedSources.length;

        // Check if domain is cited
        citedSources.forEach((source: any, index: number) => {
          if (source.link && source.link.includes(domain)) {
            isCited = true;
            if (citationPosition === null) {
              citationPosition = index + 1;
            }
          }
        });

        // Also check if domain is mentioned in the AI answer text
        if (!isCited && aiAnswer.toLowerCase().includes(domain.toLowerCase())) {
          isCited = true;
          citationPosition = citedSources.length + 1;
        }
      }

      // Calculate confidence score
      confidenceScore = calculateConfidenceScore({
        isCited,
        citationPosition,
        totalSources,
        aiAnswerLength: aiAnswer.length,
        domainMentions: (aiAnswer.match(new RegExp(domain, 'gi')) || []).length
      });

      // Determine query complexity
      queryComplexity = determineQueryComplexity(query);

      // Analyze competitors if requested
      if (include_competitor_analysis && citedSources.length > 0) {
        competitorAnalysis = analyzeCompetitors(citedSources, domain);
      }

      // Generate AI recommendations if requested
      if (include_improvement_suggestions) {
        const openaiKey = Deno.env.get('OPENAI_API_KEY');
        if (openaiKey) {
          try {
            recommendations = await generateRecommendations(query, domain, isCited, queryComplexity, totalSources, openaiKey);
            improvementAreas = extractImprovementAreas(recommendations);
          } catch (error) {
            console.error('OpenAI API error:', error);
            recommendations = generateFallbackRecommendations(isCited, queryComplexity);
            improvementAreas = ['content-optimization', 'technical-seo'];
          }
        } else {
          recommendations = generateFallbackRecommendations(isCited, queryComplexity);
          improvementAreas = ['content-optimization', 'technical-seo'];
        }
      }

      return {
        isCited,
        citationPosition,
        aiAnswer,
        citedSources,
        recommendations,
        confidenceScore,
        competitorAnalysis,
        totalSources,
        queryComplexity,
        improvementAreas
      };
    }, 'sge-citation-check');

    const result = await performCheck();

    // Store result in database with performance monitoring
    const storeResult = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const enhancedResult = {
        user_id,
        query,
        domain,
        is_cited: result.isCited,
        ai_answer: result.aiAnswer,
        cited_sources: result.citedSources,
        recommendations: result.recommendations,
        confidence_score: result.confidenceScore,
        competitor_analysis: result.competitorAnalysis,
        citation_position: result.citationPosition,
        total_sources: result.totalSources,
        query_complexity: result.queryComplexity,
        improvement_areas: result.improvementAreas,
        checked_at: new Date().toISOString()
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/citation_checks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(enhancedResult),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Database insert failed: ${error}`);
      }

      return enhancedResult;
    }, 'database-insert');

    const enhancedResult = await storeResult();

    // Cache the result for 5 minutes
    setCached(cacheKey, enhancedResult, 300000);

    return new Response(JSON.stringify(enhancedResult), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 60, windowMs: 60000 }, // 60 requests per minute
    maxRequestSize: 10240, // 10KB max request size
    allowedOrigins: ['*'] // Configure as needed
  }
);

// Helper functions with performance monitoring
const calculateConfidenceScore = withPerformanceMonitoring(({ isCited, citationPosition, totalSources, aiAnswerLength, domainMentions }: any) => {
  let score = 0;
  
  if (isCited) {
    score += 60;
    
    // Position bonus (earlier positions get higher scores)
    if (citationPosition) {
      if (citationPosition <= 3) score += 25;
      else if (citationPosition <= 5) score += 15;
      else if (citationPosition <= 10) score += 10;
      else score += 5;
    }
    
    // Multiple mentions bonus
    if (domainMentions > 1) {
      score += Math.min(domainMentions * 2, 10);
    }
  } else {
    // Factors that could lead to future citation
    if (aiAnswerLength > 200) score += 10;
    if (totalSources > 5) score += 5;
  }
  
  return Math.min(Math.max(score, 0), 100);
}, 'confidence-calculation');

const determineQueryComplexity = withPerformanceMonitoring((query: string) => {
  const words = query.split(' ').length;
  const hasQuestionWords = /\b(how|what|why|when|where|which)\b/i.test(query);
  const hasComparisons = /\b(vs|versus|compare|best|top)\b/i.test(query);
  
  if (words <= 3 && !hasQuestionWords) return 'simple';
  if (words > 8 || (hasQuestionWords && hasComparisons)) return 'complex';
  return 'medium';
}, 'complexity-analysis');

const analyzeCompetitors = withPerformanceMonitoring((citedSources: any[], targetDomain: string) => {
  const competitors: Record<string, any> = {};
  
  citedSources.forEach((source, index) => {
    const domain = extractDomainFromUrl(source.link);
    if (domain && domain !== targetDomain) {
      if (!competitors[domain]) {
        competitors[domain] = {
          domain,
          citationCount: 0,
          queries: [],
          positions: []
        };
      }
      competitors[domain].citationCount++;
      competitors[domain].positions.push(index + 1);
    }
  });
  
  return Object.values(competitors)
    .map((competitor: any) => ({
      ...competitor,
      averagePosition: competitor.positions.reduce((sum: number, pos: number) => sum + pos, 0) / competitor.positions.length
    }))
    .slice(0, 5);
}, 'competitor-analysis');

function extractDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

async function generateRecommendations(query: string, domain: string, isCited: boolean, queryComplexity: string, totalSources: number, openaiKey: string): Promise<string> {
  const prompt = `As an SEO expert, analyze this search query and provide specific recommendations for improving citation chances in AI search results.

Query: "${query}"
Domain: ${domain}
Currently Cited: ${isCited ? 'Yes' : 'No'}
Query Complexity: ${queryComplexity}
Total Sources: ${totalSources}

Provide 3-5 specific, actionable recommendations to improve the chances of being cited in AI search results. Focus on content optimization, technical SEO, and authority building.

Format your response as:
RECOMMENDATIONS:
1. [Recommendation]
2. [Recommendation]
...

IMPROVEMENT_AREAS:
keyword1, keyword2, keyword3`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

function extractImprovementAreas(recommendations: string): string[] {
  const match = recommendations.match(/IMPROVEMENT_AREAS:\s*(.+)/i);
  if (match) {
    return match[1].split(',').map(area => area.trim().toLowerCase()).slice(0, 5);
  }
  return ['content-optimization', 'technical-seo'];
}

function generateFallbackRecommendations(isCited: boolean, queryComplexity: string): string {
  const baseRecommendations = [
    "Optimize content structure with clear headings and bullet points",
    "Add relevant schema markup to help AI understand your content",
    "Create comprehensive, authoritative content that directly answers user questions",
    "Build high-quality backlinks from relevant industry sources",
    "Ensure fast page loading speeds and mobile optimization"
  ];

  if (!isCited) {
    baseRecommendations.unshift("Create content that directly addresses the search query with factual, well-sourced information");
  }

  if (queryComplexity === 'complex') {
    baseRecommendations.push("Break down complex topics into digestible sections with clear explanations");
  }

  return "RECOMMENDATIONS:\n" + baseRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n');
}

serve(secureHandler);
