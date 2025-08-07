import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

// Validate required environment variables on startup
validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

interface VoiceSearchResult {
  platform: 'google_assistant' | 'alexa' | 'siri';
  query: string;
  response: string;
  cited: boolean;
  citationScore: number;
  responseLength: number;
  sources?: string[];
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      query: { ...commonSchemas.query, maxLength: 500 },
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      platforms: { type: 'string' as const, required: false } // comma-separated: google_assistant,alexa,siri
    });

    const {
      query,
      domain,
      user_id,
      platforms = 'google_assistant,alexa,siri'
    } = validated;

    console.log('Checking voice search citations for:', { query, domain, platforms });

    const platformList = platforms.split(',').map((p: string) => p.trim()) as Array<'google_assistant' | 'alexa' | 'siri'>;
    const cacheKey = generateCacheKey('voice-citations', domain, query, platforms);
    
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const performVoiceChecks = withPerformanceMonitoring(async () => {
      const results: VoiceSearchResult[] = [];

      for (const platform of platformList) {
        try {
          const voiceResult = await checkVoicePlatform(platform, query, domain);
          if (voiceResult) {
            results.push(voiceResult);
          }
          
          // Delay between platform checks
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.error(`Error checking ${platform}:`, error);
          // Continue with other platforms
        }
      }

      return {
        query,
        domain,
        platforms: platformList,
        results,
        totalCitations: results.filter(r => r.cited).length,
        averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.citationScore, 0) / results.length : 0,
        checkedAt: new Date().toISOString()
      };
    }, 'voice-search-check');

    const finalResult = await performVoiceChecks();

    // Store results in database
    const storeResult = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
        user_id,
        query,
        domain,
        platforms: platformList,
        results: finalResult.results,
        total_citations: finalResult.totalCitations,
        average_score: finalResult.averageScore,
        checked_at: finalResult.checkedAt
      };

      const response = await fetch(`${supabaseUrl}/rest/v1/voice_citations`, {
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
        console.error('Database insert failed:', error);
        // Don't throw - return result anyway
      }

      return finalResult;
    }, 'voice-db-insert');

    const result = await storeResult();
    setCached(cacheKey, result, 600_000); // 10 minute cache

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 60_000 }, // More restrictive due to external APIs
    maxRequestSize: 10_240,
    allowedOrigins: ['*']
  }
);

async function checkVoicePlatform(
  platform: 'google_assistant' | 'alexa' | 'siri',
  query: string,
  domain: string
): Promise<VoiceSearchResult | null> {
  
  switch (platform) {
    case 'google_assistant':
      return await checkGoogleAssistant(query, domain);
    case 'alexa':
      return await checkAlexa(query, domain);
    case 'siri':
      return await checkSiri(query, domain);
    default:
      return null;
  }
}

async function checkGoogleAssistant(query: string, domain: string): Promise<VoiceSearchResult | null> {
  try {
    // Use SerpApi with device=mobile to simulate voice search
    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    if (!serpApiKey) {
      throw new Error('SerpApi key required for Google Assistant checks');
    }

    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&device=mobile&safe=active`;
    
    const response = await fetch(serpUrl);
    const data = await response.json();

    let voiceResponse = '';
    let cited = false;
    let sources: string[] = [];

    // Check for featured snippets (often used for voice responses)
    if (data.featured_snippet) {
      voiceResponse = data.featured_snippet.snippet || '';
      if (data.featured_snippet.link && data.featured_snippet.link.includes(domain)) {
        cited = true;
      }
      sources.push(data.featured_snippet.link || '');
    }

    // Check answer box
    if (data.answer_box && data.answer_box.answer) {
      voiceResponse = data.answer_box.answer;
      if (data.answer_box.link && data.answer_box.link.includes(domain)) {
        cited = true;
      }
      sources.push(data.answer_box.link || '');
    }

    // Check if domain mentioned in response text
    if (!cited && voiceResponse.toLowerCase().includes(domain.toLowerCase())) {
      cited = true;
    }

    const citationScore = calculateVoiceCitationScore(cited, voiceResponse.length, sources.length);

    return {
      platform: 'google_assistant',
      query,
      response: voiceResponse,
      cited,
      citationScore,
      responseLength: voiceResponse.length,
      sources: sources.filter(s => s)
    };

  } catch (error) {
    console.error('Google Assistant check failed:', error);
    return null;
  }
}

async function checkAlexa(query: string, domain: string): Promise<VoiceSearchResult | null> {
  try {
    // Alexa often pulls from Bing/Wikipedia - we'll simulate this
    const bingApiKey = Deno.env.get('BING_SEARCH_API_KEY');
    
    if (bingApiKey) {
      // Use Bing Search API for more accurate Alexa simulation
      const bingUrl = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5`;
      
      const response = await fetch(bingUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': bingApiKey
        }
      });
      
      const data = await response.json();
      
      let voiceResponse = '';
      let cited = false;
      let sources: string[] = [];

      // Check web results for potential voice responses
      if (data.webPages && data.webPages.value) {
        const topResult = data.webPages.value[0];
        voiceResponse = topResult.snippet || '';
        
        data.webPages.value.forEach((result: any) => {
          if (result.url && result.url.includes(domain)) {
            cited = true;
          }
          sources.push(result.url);
        });
      }

      const citationScore = calculateVoiceCitationScore(cited, voiceResponse.length, sources.length);

      return {
        platform: 'alexa',
        query,
        response: voiceResponse,
        cited,
        citationScore,
        responseLength: voiceResponse.length,
        sources: sources.slice(0, 3) // Alexa typically uses fewer sources
      };
    } else {
      // If no Bing API key, skip Alexa check instead of simulating data
      return null;
    }

  } catch (error) {
    console.error('Alexa check failed:', error);
    return null;
  }
}

async function checkSiri(query: string, domain: string): Promise<VoiceSearchResult | null> {
  try {
    // Siri often uses DuckDuckGo/Apple's own sources
    // We'll use DuckDuckGo Instant Answer API as a proxy
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(ddgUrl);
    const data = await response.json();
    
    let voiceResponse = '';
    let cited = false;
    let sources: string[] = [];

    // Check for instant answer
    if (data.Answer) {
      voiceResponse = data.Answer;
      if (data.AnswerURL && data.AnswerURL.includes(domain)) {
        cited = true;
      }
      sources.push(data.AnswerURL || '');
    }

    // Check abstract
    if (!voiceResponse && data.Abstract) {
      voiceResponse = data.Abstract;
      if (data.AbstractURL && data.AbstractURL.includes(domain)) {
        cited = true;
      }
      sources.push(data.AbstractURL || '');
    }

    // Check related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
        if (topic.FirstURL && topic.FirstURL.includes(domain)) {
          cited = true;
        }
        sources.push(topic.FirstURL);
      });
    }

    const citationScore = calculateVoiceCitationScore(cited, voiceResponse.length, sources.length);

    return {
      platform: 'siri',
      query,
      response: voiceResponse || `No direct answer found for: ${query}`,
      cited,
      citationScore,
      responseLength: voiceResponse.length,
      sources: sources.filter(s => s)
    };

  } catch (error) {
    console.error('Siri check failed:', error);
    return null;
  }
}

function calculateVoiceCitationScore(cited: boolean, responseLength: number, sourceCount: number): number {
  if (!cited) return 0;
  
  let score = 50; // Base score for being cited
  
  // Bonus for longer responses (more detailed = better)
  if (responseLength > 100) score += 20;
  if (responseLength > 200) score += 10;
  
  // Bonus for multiple sources
  score += Math.min(sourceCount * 5, 20);
  
  return Math.min(score, 100);
}

serve(secureHandler);