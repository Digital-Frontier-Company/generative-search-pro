import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

interface AIPlatformResult {
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'bard' | 'copilot';
  query: string;
  response: string;
  cited: boolean;
  citationScore: number;
  sources?: string[];
  responseLength: number;
  confidence: number;
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      query: { ...commonSchemas.query, maxLength: 500 },
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      platforms: { type: 'string' as const, required: false },
      search_method: { type: 'string' as const, required: false }
    });

    const {
      query,
      domain,
      user_id,
      platforms = 'chatgpt,claude,perplexity',
      search_method = 'simulation'
    } = validated;

    console.log('Checking AI platform citations for:', { query, domain, platforms });

    const platformList = platforms.split(',').map((p: string) => p.trim()) as Array<'chatgpt' | 'claude' | 'perplexity' | 'bard' | 'copilot'>;
    const cacheKey = generateCacheKey('ai-platforms', domain, query, platforms);
    
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const performChecks = withPerformanceMonitoring(async () => {
      const results: AIPlatformResult[] = [];

      for (const platform of platformList) {
        try {
          const result = await checkAIPlatform(platform, query, domain, search_method);
          if (result) {
            results.push(result);
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error checking ${platform}:`, error);
        }
      }

      return {
        query,
        domain,
        platforms: platformList,
        search_method,
        results,
        totalCitations: results.filter(r => r.cited).length,
        averageScore: results.length > 0 ? results.reduce((sum, r) => sum + r.citationScore, 0) / results.length : 0,
        averageConfidence: results.length > 0 ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length : 0,
        checkedAt: new Date().toISOString()
      };
    }, 'ai-platform-check');

    const finalResult = await performChecks();

    const storeResult = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
        user_id,
        query,
        domain,
        platforms: platformList,
        search_method,
        results: finalResult.results,
        total_citations: finalResult.totalCitations,
        average_score: finalResult.averageScore,
        average_confidence: finalResult.averageConfidence,
        checked_at: finalResult.checkedAt
      };

      await fetch(`${supabaseUrl}/rest/v1/ai_platform_citations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(dbPayload),
      }).catch(err => console.error('DB insert failed:', err));

      return finalResult;
    }, 'ai-platform-db-insert');

    const result = await storeResult();
    setCached(cacheKey, result, 1800000);

    return new Response(JSON.stringify(result), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 3600000 },
    maxRequestSize: 10240,
    allowedOrigins: ['*']
  }
);

async function checkAIPlatform(
  platform: 'chatgpt' | 'claude' | 'perplexity' | 'bard' | 'copilot',
  query: string,
  domain: string,
  searchMethod: string
): Promise<AIPlatformResult | null> {
  
  switch (platform) {
    case 'chatgpt':
      return await checkChatGPT(query, domain, searchMethod);
    case 'claude':
      return await checkClaude(query, domain, searchMethod);
    case 'perplexity':
      return await checkPerplexity(query, domain, searchMethod);
    default:
      return await simulateAIPlatform(platform, query, domain);
  }
}

async function checkChatGPT(query: string, domain: string, searchMethod: string): Promise<AIPlatformResult | null> {
  try {
    let response = '';
    let sources: string[] = [];
    let cited = false;
    let confidence = 60;

    if (searchMethod === 'direct' && Deno.env.get('OPENAI_API_KEY')) {
      const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
      
      const prompt = `You are ChatGPT answering: "${query}". If ${domain} is relevant, reference it naturally. Include sources as [Source: URL].`;

      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      const data = await apiResponse.json();
      response = data.choices[0]?.message?.content || '';
      
      const sourceMatches = response.match(/\[Source: ([^\]]+)\]/g) || [];
      sources = sourceMatches.map(match => match.replace(/\[Source: ([^\]]+)\]/, '$1'));
      confidence = 90;
    } else {
      response = await simulateChatGPTResponse(query, domain);
      confidence = 60;
    }

    cited = response.toLowerCase().includes(domain.toLowerCase()) || 
            sources.some(source => source.includes(domain));

    const citationScore = calculateAICitationScore(cited, response.length, sources.length, confidence);

    return {
      platform: 'chatgpt',
      query,
      response,
      cited,
      citationScore,
      sources,
      responseLength: response.length,
      confidence
    };

  } catch (error) {
    console.error('ChatGPT check failed:', error);
    return null;
  }
}

async function checkClaude(query: string, domain: string, searchMethod: string): Promise<AIPlatformResult | null> {
  try {
    let response = '';
    let sources: string[] = [];
    let cited = false;
    let confidence = 60;

    if (searchMethod === 'direct' && Deno.env.get('ANTHROPIC_API_KEY')) {
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;
      
      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `Answer this query: "${query}". If ${domain} is relevant, reference it naturally.`
          }]
        }),
      });

      const data = await apiResponse.json();
      response = data.content?.[0]?.text || '';
      confidence = 90;
    } else {
      response = await simulateClaudeResponse(query, domain);
      confidence = 60;
    }

    cited = response.toLowerCase().includes(domain.toLowerCase());
    const citationScore = calculateAICitationScore(cited, response.length, 0, confidence);

    return {
      platform: 'claude',
      query,
      response,
      cited,
      citationScore,
      sources,
      responseLength: response.length,
      confidence
    };

  } catch (error) {
    console.error('Claude check failed:', error);
    return null;
  }
}

async function checkPerplexity(query: string, domain: string, searchMethod: string): Promise<AIPlatformResult | null> {
  try {
    let response = '';
    let sources: string[] = [];
    let cited = false;
    let confidence = 70;

    if (searchMethod === 'direct' && Deno.env.get('PERPLEXITY_API_KEY')) {
      const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')!;
      
      const apiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [{
            role: 'user',
            content: query
          }],
          max_tokens: 800,
        }),
      });

      const data = await apiResponse.json();
      response = data.choices[0]?.message?.content || '';
      
      // Perplexity typically includes sources
      const sourcePattern = /\[(\d+)\]/g;
      const sourceMatches = response.match(sourcePattern) || [];
      sources = sourceMatches.map(match => `Reference ${match}`);
      confidence = 95;
    } else {
      response = await simulatePerplexityResponse(query, domain);
      sources = [`https://${domain}`, 'https://example.com/source2'];
      confidence = 70;
    }

    cited = response.toLowerCase().includes(domain.toLowerCase()) ||
            sources.some(source => source.includes(domain));

    const citationScore = calculateAICitationScore(cited, response.length, sources.length, confidence);

    return {
      platform: 'perplexity',
      query,
      response,
      cited,
      citationScore,
      sources,
      responseLength: response.length,
      confidence
    };

  } catch (error) {
    console.error('Perplexity check failed:', error);
    return null;
  }
}

async function simulateAIPlatform(platform: string, query: string, domain: string): Promise<AIPlatformResult | null> {
  const response = `Simulated ${platform} response for: ${query}. This would typically include information about the topic with potential references to authoritative sources.`;
  
  // More realistic citation probability based on domain characteristics and query type
  const domainAuthority = domain.includes('gov') ? 0.8 : domain.includes('edu') ? 0.7 : domain.includes('org') ? 0.5 : 0.3;
  const queryComplexity = query.split(' ').length > 5 ? 0.6 : 0.4; // Complex queries more likely to need citations
  const citationProbability = Math.min(0.9, domainAuthority + queryComplexity * 0.3);
  
  const cited = Math.random() < citationProbability;
  const citationScore = cited ? 
    Math.floor((domainAuthority * 40) + (queryComplexity * 30) + 30) : 
    Math.floor(Math.random() * 30);

  return {
    platform: platform as any,
    query,
    response,
    cited,
    citationScore,
    sources: cited ? [`https://${domain}`, 'https://example.com'] : [],
    responseLength: response.length,
    confidence: Math.floor(citationScore * 0.8) // Confidence correlates with citation score
  };
}

async function simulateChatGPTResponse(query: string, domain: string): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    return `Based on current information about ${query}, there are several key points to consider. This is a simulated ChatGPT response that might reference ${domain} if it's relevant to the topic.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Simulate how ChatGPT would answer: "${query}". Keep it concise and factual.`
        }],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Simulated response not available.';
  } catch (error) {
    return `Simulated ChatGPT response for: ${query}`;
  }
}

async function simulateClaudeResponse(query: string, domain: string): Promise<string> {
  return `Claude would provide a thoughtful analysis of ${query}, considering multiple perspectives and citing relevant sources when appropriate. This response format tends to be more structured and nuanced than other AI assistants.`;
}

async function simulatePerplexityResponse(query: string, domain: string): Promise<string> {
  return `${query} involves several key factors [1]. Recent developments in this area show [2]. According to authoritative sources, the main considerations include [3]. This information is continuously updated based on the latest available data.`;
}

function calculateAICitationScore(cited: boolean, responseLength: number, sourceCount: number, confidence: number): number {
  if (!cited) return 0;
  
  let score = 40; // Base score for being cited
  
  // Length bonus
  if (responseLength > 200) score += 15;
  if (responseLength > 500) score += 10;
  
  // Source bonus
  score += Math.min(sourceCount * 8, 25);
  
  // Confidence adjustment
  score = Math.round(score * (confidence / 100));
  
  return Math.min(score, 100);
}

serve(secureHandler);