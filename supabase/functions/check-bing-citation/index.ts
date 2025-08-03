import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { extractBing } from "../_shared/citation.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";
import { getJson } from "npm:serpapi@latest";

// Validate required environment variables on startup
validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      query: { ...commonSchemas.query, maxLength: 500 },
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      include_competitor_analysis: { type: 'boolean' as const, required: false },
      include_improvement_suggestions: { type: 'boolean' as const, required: false }
    });

    const {
      query,
      domain,
      user_id,
      include_competitor_analysis = false,
      include_improvement_suggestions = false
    } = validated;

    console.log('Checking Bing citation for:', { query, domain });

    const cacheKey = generateCacheKey('bing-citation', domain, query, include_competitor_analysis, include_improvement_suggestions);
    const cached = getCached(cacheKey);
    if (cached) {
      console.log('Returning cached result');
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const performCheck = withPerformanceMonitoring(async () => {
      const serpApiKey = Deno.env.get('SERPAPI_KEY');
      if (!serpApiKey) {
        throw new Error('SerpApi key not configured. Please add SERPAPI_KEY to your environment variables.');
      }

      const serpData = await retryWithBackoff(async () => {
        return new Promise((resolve, reject) => {
          getJson({
            api_key: serpApiKey,
            engine: "bing",
            q: query,
            cc: "US"
          }, (json: any) => {
            if (json.error) {
              reject(new Error(`SerpApi request failed: ${json.error}`));
            } else {
              resolve(json);
            }
          });
        });
      }, 3, 1000, 5000);

      // Use shared extractor for consistent Bing processing
      const {
        isCited,
        citationPosition,
        aiAnswer,
        citedSources,
        totalSources,
      } = extractBing(serpData, domain);

      // Additional processing variables
      let recommendations = '';
      let competitorAnalysis: any[] = [];
      let queryComplexity = 'medium';
      let improvementAreas: string[] = [];

      // Calculate confidence score
      let confidenceScore = isCited ? 70 : 20;

      queryComplexity = query.split(' ').length > 8 ? 'complex' : query.split(' ').length <= 3 ? 'simple' : 'medium';

      if (include_competitor_analysis && citedSources.length > 0) {
        competitorAnalysis = citedSources.filter((s: any) => !s.link.includes(domain)).slice(0, 5);
      }

      // no recommendations for Bing yet – reuse fallback from Google function
      if (include_improvement_suggestions) {
        recommendations = 'RECOMMENDATIONS:\n1. Improve topical authority related to query on your domain.\n2. Build backlinks from high-authority sites relative to the query.';
        improvementAreas = ['content', 'authority'];
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
        improvementAreas,
        engine: 'bing'
      };
    }, 'bing-citation-check');

    const result = await performCheck();

    const storeResult = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
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
        engine: 'bing',
        checked_at: new Date().toISOString()
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/citation_checks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(dbPayload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Database insert failed: ${error}`);
      }

      return dbPayload;
    }, 'database-insert');

    const finalResult = await storeResult();
    setCached(cacheKey, finalResult, 300_000);

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 60, windowMs: 60_000 },
    maxRequestSize: 10_240,
    allowedOrigins: ['*']
  }
);

serve(secureHandler);
