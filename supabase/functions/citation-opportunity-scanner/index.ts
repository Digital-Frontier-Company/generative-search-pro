import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

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

interface ContentAnalysis {
  contentLength: number;
  headingStructure: string[];
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  authoritySignals: string[];
  technicalIssues: string[];
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      content_url: { type: 'url' as const, required: false },
      target_queries: { type: 'string' as const, required: false }, // comma-separated
      analysis_depth: { type: 'string' as const, required: false } // quick, standard, deep
    });

    const {
      domain,
      user_id,
      content_url,
      target_queries,
      analysis_depth = 'standard'
    } = validated;

    console.log('Running citation opportunity scan for:', { domain, analysis_depth });

    const cacheKey = generateCacheKey('opportunity-scan', domain, content_url, target_queries, analysis_depth);
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const performScan = withPerformanceMonitoring(async () => {
      const opportunities: OpportunityResult[] = [];
      
      // Step 1: Get target queries (user-provided or generated)
      const queriesToAnalyze = target_queries 
        ? target_queries.split(',').map(q => q.trim())
        : await generateTargetQueries(domain, content_url);

      // Step 2: Analyze content if URL provided
      let contentAnalysis: ContentAnalysis | null = null;
      if (content_url) {
        contentAnalysis = await analyzeContent(content_url);
      }

      // Step 3: Check each query for citation opportunities
      for (const query of queriesToAnalyze.slice(0, analysis_depth === 'quick' ? 5 : analysis_depth === 'deep' ? 20 : 10)) {
        try {
          const opportunity = await analyzeQueryOpportunity(query, domain, contentAnalysis);
          opportunities.push(opportunity);
          
          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error analyzing query "${query}":`, error);
        }
      }

      // Step 4: Rank opportunities by potential
      const rankedOpportunities = opportunities.sort((a, b) => 
        (b.citationProbability * (100 - b.difficultyScore)) - (a.citationProbability * (100 - a.difficultyScore))
      );

      return {
        domain,
        contentAnalysis,
        opportunities: rankedOpportunities,
        totalOpportunities: rankedOpportunities.length,
        highPotentialCount: rankedOpportunities.filter(o => o.citationProbability > 70).length,
        averageDifficulty: rankedOpportunities.reduce((sum, o) => sum + o.difficultyScore, 0) / rankedOpportunities.length,
        estimatedTimeToResults: calculateTimeToResults(rankedOpportunities),
        scannedAt: new Date().toISOString()
      };
    }, 'opportunity-scan');

    const results = await performScan();

    // Store in database
    const storeResults = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
        user_id,
        domain,
        content_url,
        analysis_depth,
        opportunities: results.opportunities,
        total_opportunities: results.totalOpportunities,
        high_potential_count: results.highPotentialCount,
        average_difficulty: results.averageDifficulty,
        estimated_time_to_results: results.estimatedTimeToResults,
        scanned_at: results.scannedAt
      };

      await fetch(`${supabaseUrl}/rest/v1/opportunity_scans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(dbPayload),
      }).catch(err => console.error('DB insert failed:', err));

      return results;
    }, 'opportunity-db-store');

    const finalResults = await storeResults();
    setCached(cacheKey, finalResults, 3600000); // 1 hour cache

    return new Response(JSON.stringify(finalResults), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 300000 }, // 10 requests per 5 minutes
    maxRequestSize: 20480,
    allowedOrigins: ['*']
  }
);

async function generateTargetQueries(domain: string, contentUrl?: string): Promise<string[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const prompt = contentUrl 
    ? `Analyze this URL: ${contentUrl} and the domain ${domain}. Generate 15 specific search queries that users might ask voice assistants or AI tools where this content could potentially be cited. Focus on informational queries, how-to questions, and comparison queries. Return only the queries, one per line.`
    : `For the domain ${domain}, generate 15 search queries that users commonly ask voice assistants or AI tools where this domain could potentially be cited. Focus on the domain's likely expertise areas. Return only the queries, one per line.`;

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
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const queriesText = data.choices[0]?.message?.content || '';
    
    return queriesText.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .slice(0, 15);
  } catch (error) {
    console.error('Error generating queries:', error);
    return [
      `what is ${domain}`,
      `how does ${domain} work`,
      `${domain} vs competitors`,
      `${domain} reviews`,
      `best practices from ${domain}`
    ];
  }
}

async function analyzeContent(url: string): Promise<ContentAnalysis | null> {
  try {
    // Fetch page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CitationScanner/1.0)'
      }
    });
    
    const html = await response.text();
    const text = extractTextFromHtml(html);
    
    return {
      contentLength: text.length,
      headingStructure: extractHeadings(html),
      keywordDensity: calculateKeywordDensity(text),
      readabilityScore: calculateReadabilityScore(text),
      authoritySignals: extractAuthoritySignals(html),
      technicalIssues: detectTechnicalIssues(html)
    };
  } catch (error) {
    console.error('Content analysis failed:', error);
    return null;
  }
}

async function analyzeQueryOpportunity(query: string, domain: string, contentAnalysis: ContentAnalysis | null): Promise<OpportunityResult> {
  // Check current SERP position
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  let currentRanking: number | null = null;
  let competitorData: any[] = [];

  if (serpApiKey) {
    try {
      const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&num=20`;
      const response = await fetch(serpUrl);
      const data = await response.json();

      // Find current ranking
      if (data.organic_results) {
        const rankIndex = data.organic_results.findIndex((result: any) => 
          result.link && result.link.includes(domain)
        );
        currentRanking = rankIndex !== -1 ? rankIndex + 1 : null;
        competitorData = data.organic_results.slice(0, 5);
      }
    } catch (error) {
      console.error('SERP analysis failed:', error);
    }
  }

  // Use AI to analyze opportunity
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  const analysisPrompt = `Analyze the citation opportunity for this search query: "${query}" and domain: ${domain}

Current ranking: ${currentRanking || 'Not in top 20'}
Content analysis: ${contentAnalysis ? JSON.stringify(contentAnalysis) : 'Not available'}
Top competitors: ${competitorData.map(c => c.title).join(', ')}

Provide a JSON response with this exact structure:
{
  "citationProbability": 85,
  "contentGaps": ["missing specific data", "needs more examples"],
  "competitorAdvantages": ["longer content", "better sources"],
  "optimizationActions": ["add statistics", "improve headings"],
  "timeToRank": "2-3 months",
  "difficultyScore": 65
}

Base the scores on:
- Citation probability (0-100): How likely this content could be cited
- Difficulty score (0-100): How hard it would be to rank/get cited
- Time to rank: Realistic timeframe based on competition`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 600,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content || '';
    
    try {
      const analysis = JSON.parse(analysisText);
      return {
        query,
        domain,
        currentRanking,
        ...analysis
      };
    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      return createFallbackOpportunity(query, domain, currentRanking);
    }
  } catch (error) {
    console.error('AI analysis failed:', error);
    return createFallbackOpportunity(query, domain, currentRanking);
  }
}

function createFallbackOpportunity(query: string, domain: string, currentRanking: number | null): OpportunityResult {
  return {
    query,
    domain,
    currentRanking,
    citationProbability: currentRanking ? Math.max(80 - currentRanking * 3, 20) : 45,
    contentGaps: ['Content analysis needed'],
    competitorAdvantages: ['Competitor analysis needed'],
    optimizationActions: ['Improve content quality', 'Add authoritative sources'],
    timeToRank: '3-6 months',
    difficultyScore: 60
  };
}

function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(html: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: string[] = [];
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push(match[1].replace(/<[^>]+>/g, '').trim());
  }
  
  return headings;
}

function calculateKeywordDensity(text: string): Record<string, number> {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const wordCount: Record<string, number> = {};
  
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  const totalWords = words.length;
  const density: Record<string, number> = {};
  
  Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([word, count]) => {
      density[word] = (count / totalWords) * 100;
    });
  
  return density;
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const avgWordsPerSentence = words / sentences;
  
  // Simple readability heuristic (lower is better)
  if (avgWordsPerSentence < 15) return 85;
  if (avgWordsPerSentence < 20) return 70;
  if (avgWordsPerSentence < 25) return 55;
  return 40;
}

function extractAuthoritySignals(html: string): string[] {
  const signals: string[] = [];
  
  if (html.includes('schema.org')) signals.push('Schema markup');
  if (html.includes('author')) signals.push('Author information');
  if (html.includes('published') || html.includes('date')) signals.push('Publication date');
  if (html.includes('citation') || html.includes('reference')) signals.push('Citations/References');
  
  return signals;
}

function detectTechnicalIssues(html: string): string[] {
  const issues: string[] = [];
  
  if (!html.includes('<title>')) issues.push('Missing title tag');
  if (!html.includes('meta name="description"')) issues.push('Missing meta description');
  if (html.length < 1000) issues.push('Thin content');
  
  return issues;
}

function calculateTimeToResults(opportunities: OpportunityResult[]): string {
  if (opportunities.length === 0) return 'Unknown';
  
  const avgDifficulty = opportunities.reduce((sum, o) => sum + o.difficultyScore, 0) / opportunities.length;
  
  if (avgDifficulty < 30) return '2-4 weeks';
  if (avgDifficulty < 50) return '1-2 months';
  if (avgDifficulty < 70) return '2-4 months';
  return '4-8 months';
}

serve(secureHandler);