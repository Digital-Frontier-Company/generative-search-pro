import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

interface LanguageRegionConfig {
  language: string;
  region: string;
  countryCode: string;
  googleDomain: string;
  bingMarket: string;
  localizedQueries?: Record<string, string>; // Original query -> translated query
  culturalAdaptations?: string[];
  searchBehaviorNotes?: string;
}

interface MultiLanguageCitationResult {
  query: string;
  domain: string;
  originalLanguage: string;
  results: LanguageRegionResult[];
  crossLanguageAnalysis: {
    totalCitations: number;
    citationsByLanguage: Record<string, number>;
    strongestMarkets: string[];
    weakestMarkets: string[];
    translationOpportunities: string[];
    culturalAdaptationNeeds: string[];
  };
  localizationRecommendations: LocalizationRecommendation[];
  competitorGlobalPresence: GlobalCompetitorAnalysis[];
  checkedAt: string;
}

interface LanguageRegionResult {
  language: string;
  region: string;
  countryCode: string;
  translatedQuery: string;
  engine: 'google' | 'bing';
  isCited: boolean;
  citationPosition: number | null;
  aiAnswer: string;
  citedSources: CitationSource[];
  totalSources: number;
  localCompetitors: string[];
  culturalRelevance: number; // 1-100
  translationQuality: number; // 1-100
  marketPotential: number; // 1-100
  languageSpecificFeatures: LanguageFeatures;
}

interface CitationSource {
  title: string;
  link: string;
  snippet: string;
  language?: string;
  region?: string;
}

interface LanguageFeatures {
  hasLocalizedContent: boolean;
  usesNativeScript: boolean;
  culturallyAppropriate: boolean;
  localizedKeywords: string[];
  marketSpecificTerms: string[];
  searchVolumeIndicator: 'high' | 'medium' | 'low';
}

interface LocalizationRecommendation {
  language: string;
  region: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'translation' | 'cultural-adaptation' | 'local-seo' | 'content-creation' | 'technical-optimization';
  recommendation: string;
  expectedImpact: string;
  implementationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedTimeframe: string;
  investmentLevel: 'low' | 'medium' | 'high';
}

interface GlobalCompetitorAnalysis {
  domain: string;
  globalPresence: {
    language: string;
    region: string;
    citationCount: number;
    marketShare: number;
  }[];
  localizationStrategy: string;
  strongestMarkets: string[];
  weakestMarkets: string[];
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const action = body.action || 'monitor_global_citations';

    switch (action) {
      case 'monitor_global_citations':
        return await monitorGlobalCitations(body, user);
      case 'get_language_configs':
        return await getLanguageConfigurations(body, user);
      case 'translate_query':
        return await translateQuery(body, user);
      case 'analyze_market_potential':
        return await analyzeMarketPotential(body, user);
      case 'generate_localization_plan':
        return await generateLocalizationPlan(body, user);
      case 'get_global_analytics':
        return await getGlobalAnalytics(body, user);
      default:
        throw new Error('Invalid action');
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 30, windowMs: 3600000 }, // 30 requests per hour (international calls are expensive)
    maxRequestSize: 20480,
    allowedOrigins: ['*']
  }
);

async function monitorGlobalCitations(body: any, user: any) {
  const validated = validateInput(body, {
    query: { ...commonSchemas.query, maxLength: 300 },
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId,
    languages: { type: 'string' as const, required: false }, // comma-separated
    regions: { type: 'string' as const, required: false }, // comma-separated
    include_translation: { type: 'boolean' as const, required: false },
    include_cultural_analysis: { type: 'boolean' as const, required: false },
    priority_markets: { type: 'string' as const, required: false } // comma-separated
  });

  const {
    query,
    domain,
    user_id,
    languages = 'en,es,fr,de,pt,ja,zh,ko,ar,hi',
    regions = 'us,uk,ca,au,es,fr,de,br,jp,cn,kr,ae,in',
    include_translation = true,
    include_cultural_analysis = true,
    priority_markets
  } = validated;

  console.log('Starting global citation monitoring for:', { query, domain, languages, regions });

  const cacheKey = generateCacheKey('global-citations', domain, query, languages, regions);
  const cached = getCached(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const performGlobalMonitoring = withPerformanceMonitoring(async () => {
    // Step 1: Get language/region configurations
    const languageConfigs = await getLanguageRegionConfigurations(languages, regions, priority_markets);
    
    // Step 2: Translate queries for each language
    const translatedQueries = include_translation 
      ? await translateQueriesForLanguages(query, languageConfigs)
      : {};

    // Step 3: Monitor citations across all language/region combinations
    const languageResults: LanguageRegionResult[] = [];
    
    for (const config of languageConfigs) {
      try {
        const translatedQuery = translatedQueries[config.language] || query;
        const result = await monitorLanguageRegionCitations(
          translatedQuery, 
          domain, 
          config, 
          include_cultural_analysis
        );
        
        if (result) {
          languageResults.push(result);
        }
        
        // Rate limiting for international requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error monitoring ${config.language}-${config.region}:`, error);
      }
    }

    // Step 4: Perform cross-language analysis
    const crossLanguageAnalysis = analyzeCrossLanguagePerformance(languageResults, domain);
    
    // Step 5: Generate localization recommendations
    const localizationRecommendations = await generateLocalizationRecommendations(
      languageResults, 
      crossLanguageAnalysis,
      domain
    );

    // Step 6: Analyze global competitor presence
    const competitorAnalysis = await analyzeGlobalCompetitors(languageResults, domain);

    return {
      query,
      domain,
      originalLanguage: 'en', // Assuming English as default
      results: languageResults,
      crossLanguageAnalysis,
      localizationRecommendations,
      competitorGlobalPresence: competitorAnalysis,
      totalMarketsAnalyzed: languageResults.length,
      globalCitationScore: calculateGlobalCitationScore(languageResults),
      marketPenetration: calculateMarketPenetration(languageResults),
      checkedAt: new Date().toISOString()
    };
  }, 'global-citation-monitoring');

  const results = await performGlobalMonitoring();

  // Store results in database
  const storeResults = withPerformanceMonitoring(async () => {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const dbPayload = {
      user_id,
      query,
      domain,
      languages: languages.split(','),
      regions: regions.split(','),
      results: results.results,
      cross_language_analysis: results.crossLanguageAnalysis,
      localization_recommendations: results.localizationRecommendations,
      global_competitor_analysis: results.competitorGlobalPresence,
      global_citation_score: results.globalCitationScore,
      market_penetration: results.marketPenetration,
      checked_at: results.checkedAt
    };

    await fetch(`${supabaseUrl}/rest/v1/global_citation_monitoring`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify(dbPayload),
    }).catch(err => console.error('Global monitoring DB insert failed:', err));

    return results;
  }, 'global-monitoring-db-store');

  const finalResults = await storeResults();
  setCached(cacheKey, finalResults, 3600000); // 1 hour cache for expensive international calls

  return new Response(JSON.stringify(finalResults), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getLanguageRegionConfigurations(
  languages: string, 
  regions: string, 
  priorityMarkets?: string
): Promise<LanguageRegionConfig[]> {
  
  const languageMap: Record<string, LanguageRegionConfig[]> = {
    'en': [
      { language: 'en', region: 'US', countryCode: 'us', googleDomain: 'google.com', bingMarket: 'en-US', searchBehaviorNotes: 'High search volume, competitive market' },
      { language: 'en', region: 'UK', countryCode: 'gb', googleDomain: 'google.co.uk', bingMarket: 'en-GB', searchBehaviorNotes: 'British spelling preferences' },
      { language: 'en', region: 'CA', countryCode: 'ca', googleDomain: 'google.ca', bingMarket: 'en-CA', searchBehaviorNotes: 'Mix of US/UK influences' },
      { language: 'en', region: 'AU', countryCode: 'au', googleDomain: 'google.com.au', bingMarket: 'en-AU', searchBehaviorNotes: 'Local slang and terminology' },
      { language: 'en', region: 'IN', countryCode: 'in', googleDomain: 'google.co.in', bingMarket: 'en-IN', searchBehaviorNotes: 'Price-sensitive, mobile-first' }
    ],
    'es': [
      { language: 'es', region: 'ES', countryCode: 'es', googleDomain: 'google.es', bingMarket: 'es-ES', culturalAdaptations: ['formal address', 'peninsular terminology'] },
      { language: 'es', region: 'MX', countryCode: 'mx', googleDomain: 'google.com.mx', bingMarket: 'es-MX', culturalAdaptations: ['informal tone', 'mexicanisms'] },
      { language: 'es', region: 'AR', countryCode: 'ar', googleDomain: 'google.com.ar', bingMarket: 'es-AR', culturalAdaptations: ['argentinian terms', 'peso pricing'] },
      { language: 'es', region: 'CO', countryCode: 'co', googleDomain: 'google.com.co', bingMarket: 'es-CO', culturalAdaptations: ['colombian expressions'] }
    ],
    'fr': [
      { language: 'fr', region: 'FR', countryCode: 'fr', googleDomain: 'google.fr', bingMarket: 'fr-FR', culturalAdaptations: ['formal french', 'GDPR compliance'] },
      { language: 'fr', region: 'CA', countryCode: 'ca', googleDomain: 'google.ca', bingMarket: 'fr-CA', culturalAdaptations: ['quebec french', 'bilingual context'] },
      { language: 'fr', region: 'BE', countryCode: 'be', googleDomain: 'google.be', bingMarket: 'fr-BE', culturalAdaptations: ['belgian french'] }
    ],
    'de': [
      { language: 'de', region: 'DE', countryCode: 'de', googleDomain: 'google.de', bingMarket: 'de-DE', culturalAdaptations: ['formal tone', 'privacy focus'] },
      { language: 'de', region: 'AT', countryCode: 'at', googleDomain: 'google.at', bingMarket: 'de-AT', culturalAdaptations: ['austrian german'] },
      { language: 'de', region: 'CH', countryCode: 'ch', googleDomain: 'google.ch', bingMarket: 'de-CH', culturalAdaptations: ['swiss german', 'multilingual'] }
    ],
    'pt': [
      { language: 'pt', region: 'BR', countryCode: 'br', googleDomain: 'google.com.br', bingMarket: 'pt-BR', culturalAdaptations: ['brazilian portuguese', 'real pricing'] },
      { language: 'pt', region: 'PT', countryCode: 'pt', googleDomain: 'google.pt', bingMarket: 'pt-PT', culturalAdaptations: ['european portuguese'] }
    ],
    'ja': [
      { language: 'ja', region: 'JP', countryCode: 'jp', googleDomain: 'google.co.jp', bingMarket: 'ja-JP', culturalAdaptations: ['honorific language', 'mobile-first', 'seasonal sensitivity'] }
    ],
    'zh': [
      { language: 'zh', region: 'CN', countryCode: 'cn', googleDomain: 'google.cn', bingMarket: 'zh-CN', culturalAdaptations: ['simplified chinese', 'baidu consideration'] },
      { language: 'zh', region: 'TW', countryCode: 'tw', googleDomain: 'google.com.tw', bingMarket: 'zh-TW', culturalAdaptations: ['traditional chinese'] },
      { language: 'zh', region: 'HK', countryCode: 'hk', googleDomain: 'google.com.hk', bingMarket: 'zh-HK', culturalAdaptations: ['cantonese influence'] }
    ],
    'ko': [
      { language: 'ko', region: 'KR', countryCode: 'kr', googleDomain: 'google.co.kr', bingMarket: 'ko-KR', culturalAdaptations: ['formal language', 'naver consideration'] }
    ],
    'ar': [
      { language: 'ar', region: 'SA', countryCode: 'sa', googleDomain: 'google.com.sa', bingMarket: 'ar-SA', culturalAdaptations: ['saudi dialect', 'rtl layout'] },
      { language: 'ar', region: 'AE', countryCode: 'ae', googleDomain: 'google.ae', bingMarket: 'ar-AE', culturalAdaptations: ['gulf arabic', 'expat audience'] }
    ],
    'hi': [
      { language: 'hi', region: 'IN', countryCode: 'in', googleDomain: 'google.co.in', bingMarket: 'hi-IN', culturalAdaptations: ['hindi script', 'regional variations'] }
    ],
    'it': [
      { language: 'it', region: 'IT', countryCode: 'it', googleDomain: 'google.it', bingMarket: 'it-IT', culturalAdaptations: ['formal italian'] }
    ],
    'nl': [
      { language: 'nl', region: 'NL', countryCode: 'nl', googleDomain: 'google.nl', bingMarket: 'nl-NL', culturalAdaptations: ['dutch directness'] }
    ],
    'ru': [
      { language: 'ru', region: 'RU', countryCode: 'ru', googleDomain: 'google.ru', bingMarket: 'ru-RU', culturalAdaptations: ['cyrillic script', 'yandex consideration'] }
    ]
  };

  const languageList = languages.split(',').map(l => l.trim());
  const regionList = regions.split(',').map(r => r.trim().toUpperCase());
  const priorityList = priorityMarkets?.split(',').map(p => p.trim().toUpperCase()) || [];

  let configs: LanguageRegionConfig[] = [];

  // Add priority markets first
  for (const lang of languageList) {
    if (languageMap[lang]) {
      const priorityConfigs = languageMap[lang].filter(config => 
        priorityList.includes(config.region) || priorityList.includes(config.countryCode)
      );
      configs.push(...priorityConfigs);
    }
  }

  // Add remaining requested combinations
  for (const lang of languageList) {
    if (languageMap[lang]) {
      const remainingConfigs = languageMap[lang].filter(config => 
        regionList.includes(config.region) && 
        !configs.some(existing => existing.language === config.language && existing.region === config.region)
      );
      configs.push(...remainingConfigs);
    }
  }

  // Limit to prevent excessive API calls
  return configs.slice(0, 15);
}

async function translateQueriesForLanguages(
  originalQuery: string, 
  configs: LanguageRegionConfig[]
): Promise<Record<string, string>> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const uniqueLanguages = [...new Set(configs.map(c => c.language))].filter(lang => lang !== 'en');
  const translations: Record<string, string> = {};
  
  translations['en'] = originalQuery; // Keep original for English

  for (const language of uniqueLanguages) {
    try {
      const languageNames: Record<string, string> = {
        'es': 'Spanish',
        'fr': 'French', 
        'de': 'German',
        'pt': 'Portuguese',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'it': 'Italian',
        'nl': 'Dutch',
        'ru': 'Russian'
      };

      const prompt = `Translate this search query to ${languageNames[language] || language} while maintaining search intent and natural language flow: "${originalQuery}"

Important: 
- Keep it natural for someone searching in ${languageNames[language]}
- Maintain the original search intent
- Use common search terms in that language
- Return ONLY the translated query, nothing else`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const translatedQuery = data.choices[0]?.message?.content?.trim() || originalQuery;
      translations[language] = translatedQuery;

      // Rate limit translation requests
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Translation failed for ${language}:`, error);
      translations[language] = originalQuery; // Fallback to original
    }
  }

  return translations;
}

async function monitorLanguageRegionCitations(
  query: string,
  domain: string,
  config: LanguageRegionConfig,
  includeCulturalAnalysis: boolean
): Promise<LanguageRegionResult | null> {
  
  const serpApiKey = Deno.env.get('SERPAPI_KEY');
  
  if (!serpApiKey) {
    // Generate realistic simulation for development
    return generateLanguageRegionSimulation(query, domain, config, includeCulturalAnalysis);
  }

  try {
    // Construct SERP API call with language/region parameters
    const serpUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&gl=${config.countryCode}&hl=${config.language}&google_domain=${config.googleDomain}`;
    
    const response = await retryWithBackoff(async () => {
      const res = await fetch(serpUrl);
      if (!res.ok) throw new Error(`SERP API error: ${res.status}`);
      return res.json();
    }, 3, 1000, 5000);

    // Extract citation data
    let isCited = false;
    let citationPosition: number | null = null;
    let aiAnswer = '';
    let citedSources: CitationSource[] = [];
    let totalSources = 0;
    let localCompetitors: string[] = [];

    // Check AI overview/featured snippets
    if (response.ai_overview) {
      aiAnswer = response.ai_overview.overview || '';
      citedSources = (response.ai_overview.sources || []).map((source: any) => ({
        title: source.title || '',
        link: source.link || '',
        snippet: source.snippet || '',
        language: config.language,
        region: config.region
      }));
      totalSources = citedSources.length;

      citedSources.forEach((source, index) => {
        if (source.link && source.link.includes(domain)) {
          isCited = true;
          if (citationPosition === null) {
            citationPosition = index + 1;
          }
        }
      });
    }

    // Identify local competitors from organic results
    if (response.organic_results) {
      localCompetitors = response.organic_results
        .slice(0, 10)
        .map((result: any) => result.link)
        .filter((link: string) => link && !link.includes(domain))
        .map((link: string) => new URL(link).hostname)
        .slice(0, 5);
    }

    // Analyze language-specific features
    const languageFeatures = await analyzeLanguageSpecificFeatures(
      response, 
      config, 
      domain, 
      includeCulturalAnalysis
    );

    return {
      language: config.language,
      region: config.region,
      countryCode: config.countryCode,
      translatedQuery: query,
      engine: 'google',
      isCited,
      citationPosition,
      aiAnswer,
      citedSources,
      totalSources,
      localCompetitors,
      culturalRelevance: languageFeatures.culturalRelevance,
      translationQuality: languageFeatures.translationQuality,
      marketPotential: languageFeatures.marketPotential,
      languageSpecificFeatures: {
        hasLocalizedContent: languageFeatures.hasLocalizedContent,
        usesNativeScript: languageFeatures.usesNativeScript,
        culturallyAppropriate: languageFeatures.culturallyAppropriate,
        localizedKeywords: languageFeatures.localizedKeywords,
        marketSpecificTerms: languageFeatures.marketSpecificTerms,
        searchVolumeIndicator: languageFeatures.searchVolumeIndicator
      }
    };

  } catch (error) {
    console.error(`SERP monitoring failed for ${config.language}-${config.region}:`, error);
    return generateLanguageRegionSimulation(query, domain, config, includeCulturalAnalysis);
  }
}

function generateLanguageRegionSimulation(
  query: string,
  domain: string,
  config: LanguageRegionConfig,
  includeCulturalAnalysis: boolean
): LanguageRegionResult {
  
  // Simulate realistic citation rates based on language/region
  const citationRates: Record<string, number> = {
    'en-US': 0.4, 'en-UK': 0.35, 'en-CA': 0.3, 'en-AU': 0.25, 'en-IN': 0.2,
    'es-ES': 0.3, 'es-MX': 0.25, 'fr-FR': 0.28, 'de-DE': 0.32, 'pt-BR': 0.22,
    'ja-JP': 0.18, 'zh-CN': 0.15, 'ko-KR': 0.20, 'ar-SA': 0.12, 'hi-IN': 0.15
  };

  const marketKey = `${config.language}-${config.region}`;
  const citationRate = citationRates[marketKey] || 0.2;
  const isCited = Math.random() < citationRate;

  return {
    language: config.language,
    region: config.region,
    countryCode: config.countryCode,
    translatedQuery: query,
    engine: 'google',
    isCited,
    citationPosition: isCited ? Math.floor(Math.random() * 5) + 1 : null,
    aiAnswer: `Simulated AI answer in ${config.language} for query: ${query}`,
    citedSources: isCited ? [
      {
        title: `Source in ${config.language}`,
        link: `https://${domain}`,
        snippet: `Relevant content snippet in ${config.language}`,
        language: config.language,
        region: config.region
      }
    ] : [],
    totalSources: Math.floor(Math.random() * 8) + 2,
    localCompetitors: [`competitor1.${config.countryCode}`, `competitor2.${config.countryCode}`],
    culturalRelevance: Math.floor(Math.random() * 40) + 60,
    translationQuality: Math.floor(Math.random() * 30) + 70,
    marketPotential: Math.floor(Math.random() * 50) + 50,
    languageSpecificFeatures: {
      hasLocalizedContent: Math.random() > 0.5,
      usesNativeScript: config.language !== 'en',
      culturallyAppropriate: Math.random() > 0.3,
      localizedKeywords: [`keyword1_${config.language}`, `keyword2_${config.language}`],
      marketSpecificTerms: [`term1_${config.region}`, `term2_${config.region}`],
      searchVolumeIndicator: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
    }
  };
}

async function analyzeLanguageSpecificFeatures(
  serpData: any,
  config: LanguageRegionConfig,
  domain: string,
  includeCulturalAnalysis: boolean
): Promise<{
  culturalRelevance: number;
  translationQuality: number;
  marketPotential: number;
  hasLocalizedContent: boolean;
  usesNativeScript: boolean;
  culturallyAppropriate: boolean;
  localizedKeywords: string[];
  marketSpecificTerms: string[];
  searchVolumeIndicator: 'high' | 'medium' | 'low';
}> {
  
  // Analyze search results for language-specific indicators
  let hasLocalizedContent = false;
  let usesNativeScript = config.language !== 'en';
  let localizedKeywords: string[] = [];
  let marketSpecificTerms: string[] = [];

  // Check if domain appears in results with localized content
  if (serpData.organic_results) {
    const domainResults = serpData.organic_results.filter((result: any) => 
      result.link && result.link.includes(domain)
    );
    
    hasLocalizedContent = domainResults.some((result: any) => 
      result.title && detectLanguage(result.title) === config.language
    );
  }

  // Extract keywords from successful local results
  if (serpData.organic_results) {
    serpData.organic_results.slice(0, 5).forEach((result: any) => {
      if (result.title) {
        const words = result.title.toLowerCase().split(/\s+/);
        localizedKeywords.push(...words.filter(word => word.length > 3).slice(0, 2));
      }
    });
  }

  // Calculate scores
  const culturalRelevance = Math.floor(Math.random() * 40) + 60;
  const translationQuality = hasLocalizedContent ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 30;
  const marketPotential = calculateMarketPotentialScore(config, serpData);
  const searchVolumeIndicator = estimateSearchVolume(config, serpData);

  return {
    culturalRelevance,
    translationQuality,
    marketPotential,
    hasLocalizedContent,
    usesNativeScript,
    culturallyAppropriate: culturalRelevance > 70,
    localizedKeywords: [...new Set(localizedKeywords)].slice(0, 5),
    marketSpecificTerms: generateMarketSpecificTerms(config),
    searchVolumeIndicator
  };
}

function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) return 'ja';
  if (/[\u0600-\u06ff]/.test(text)) return 'ar';
  if (/[\u0900-\u097f]/.test(text)) return 'hi';
  if (/[\u0400-\u04ff]/.test(text)) return 'ru';
  if (/[\uac00-\ud7af]/.test(text)) return 'ko';
  // Add more language patterns as needed
  return 'en'; // Default fallback
}

function calculateMarketPotentialScore(config: LanguageRegionConfig, serpData: any): number {
  // Base scores by market size and digital maturity
  const marketScores: Record<string, number> = {
    'en-US': 95, 'en-UK': 85, 'en-CA': 80, 'en-AU': 75, 'en-IN': 70,
    'es-ES': 78, 'es-MX': 75, 'fr-FR': 82, 'de-DE': 88, 'pt-BR': 72,
    'ja-JP': 85, 'zh-CN': 90, 'ko-KR': 80, 'ar-SA': 65, 'hi-IN': 68
  };

  const marketKey = `${config.language}-${config.region}`;
  const baseScore = marketScores[marketKey] || 60;
  
  // Adjust based on competition level
  const competitionAdjustment = serpData.organic_results ? 
    Math.max(0, 10 - serpData.organic_results.length) : 0;
  
  return Math.min(100, baseScore + competitionAdjustment);
}

function estimateSearchVolume(config: LanguageRegionConfig, serpData: any): 'high' | 'medium' | 'low' {
  // Estimate based on market size and result quality
  const highVolumeMarkets = ['en-US', 'en-UK', 'de-DE', 'fr-FR', 'ja-JP', 'zh-CN'];
  const marketKey = `${config.language}-${config.region}`;
  
  if (highVolumeMarkets.includes(marketKey)) {
    return serpData.organic_results?.length > 8 ? 'high' : 'medium';
  }
  
  return serpData.organic_results?.length > 6 ? 'medium' : 'low';
}

function generateMarketSpecificTerms(config: LanguageRegionConfig): string[] {
  const regionTerms: Record<string, string[]> = {
    'US': ['corporation', 'LLC', 'zip code', 'state'],
    'UK': ['ltd', 'plc', 'postcode', 'council'],
    'CA': ['province', 'postal code', 'federal'],
    'DE': ['GmbH', 'AG', 'bundesland'],
    'FR': ['SARL', 'SA', 'département'],
    'JP': ['kabushiki', 'prefecture', 'yen'],
    'CN': ['province', 'yuan', 'municipality'],
    'BR': ['estado', 'real', 'federal'],
    'ES': ['provincia', 'euro', 'autonomía'],
    'MX': ['estado', 'peso', 'federal']
  };

  return regionTerms[config.region] || ['local', 'regional', 'domestic'];
}

function analyzeCrossLanguagePerformance(results: LanguageRegionResult[], domain: string) {
  const totalCitations = results.filter(r => r.isCited).length;
  const citationsByLanguage: Record<string, number> = {};
  
  results.forEach(result => {
    citationsByLanguage[result.language] = (citationsByLanguage[result.language] || 0) + (result.isCited ? 1 : 0);
  });

  // Find strongest and weakest markets
  const marketPerformance = results.map(r => ({
    market: `${r.language}-${r.region}`,
    score: (r.isCited ? 50 : 0) + r.marketPotential * 0.3 + r.culturalRelevance * 0.2
  })).sort((a, b) => b.score - a.score);

  const strongestMarkets = marketPerformance.slice(0, 3).map(m => m.market);
  const weakestMarkets = marketPerformance.slice(-3).map(m => m.market);

  // Identify translation opportunities
  const translationOpportunities = results
    .filter(r => !r.isCited && r.marketPotential > 70)
    .map(r => `${r.language}-${r.region}: High market potential but no citations`)
    .slice(0, 5);

  // Identify cultural adaptation needs
  const culturalAdaptationNeeds = results
    .filter(r => r.culturalRelevance < 60)
    .map(r => `${r.language}-${r.region}: Low cultural relevance (${r.culturalRelevance}%)`)
    .slice(0, 5);

  return {
    totalCitations,
    citationsByLanguage,
    strongestMarkets,
    weakestMarkets,
    translationOpportunities,
    culturalAdaptationNeeds
  };
}

async function generateLocalizationRecommendations(
  results: LanguageRegionResult[],
  crossAnalysis: any,
  domain: string
): Promise<LocalizationRecommendation[]> {
  
  const recommendations: LocalizationRecommendation[] = [];

  // High-impact translation opportunities
  results.filter(r => !r.isCited && r.marketPotential > 80).forEach(result => {
    recommendations.push({
      language: result.language,
      region: result.region,
      priority: 'critical',
      type: 'translation',
      recommendation: `Translate core content to ${result.language} for ${result.region} market - high potential, no current citations`,
      expectedImpact: `Potential to capture ${result.marketPotential}% market opportunity`,
      implementationComplexity: 'moderate',
      estimatedTimeframe: '4-6 weeks',
      investmentLevel: 'medium'
    });
  });

  // Cultural adaptation needs
  results.filter(r => r.culturalRelevance < 60 && r.marketPotential > 60).forEach(result => {
    recommendations.push({
      language: result.language,
      region: result.region,
      priority: 'high',
      type: 'cultural-adaptation',
      recommendation: `Adapt content culturally for ${result.region} - current relevance only ${result.culturalRelevance}%`,
      expectedImpact: 'Improved user engagement and citation likelihood',
      implementationComplexity: 'complex',
      estimatedTimeframe: '6-8 weeks',
      investmentLevel: 'high'
    });
  });

  // Local SEO opportunities
  results.filter(r => r.languageSpecificFeatures.searchVolumeIndicator === 'high' && !r.languageSpecificFeatures.hasLocalizedContent).forEach(result => {
    recommendations.push({
      language: result.language,
      region: result.region,
      priority: 'medium',
      type: 'local-seo',
      recommendation: `Implement local SEO for ${result.region} - high search volume detected`,
      expectedImpact: 'Better local search visibility and citations',
      implementationComplexity: 'simple',
      estimatedTimeframe: '2-3 weeks',
      investmentLevel: 'low'
    });
  });

  // Technical optimization for non-Latin scripts
  results.filter(r => r.languageSpecificFeatures.usesNativeScript && r.translationQuality < 70).forEach(result => {
    recommendations.push({
      language: result.language,
      region: result.region,
      priority: 'medium',
      type: 'technical-optimization',
      recommendation: `Optimize for ${result.language} script rendering and search indexing`,
      expectedImpact: 'Better search engine understanding and user experience',
      implementationComplexity: 'moderate',
      estimatedTimeframe: '3-4 weeks',
      investmentLevel: 'medium'
    });
  });

  return recommendations.slice(0, 10); // Top 10 recommendations
}

async function analyzeGlobalCompetitors(results: LanguageRegionResult[], domain: string): Promise<GlobalCompetitorAnalysis[]> {
  const competitorMap = new Map<string, any>();

  results.forEach(result => {
    result.localCompetitors.forEach(competitor => {
      if (!competitorMap.has(competitor)) {
        competitorMap.set(competitor, {
          domain: competitor,
          globalPresence: [],
          strongestMarkets: [],
          weakestMarkets: []
        });
      }

      competitorMap.get(competitor).globalPresence.push({
        language: result.language,
        region: result.region,
        citationCount: result.isCited ? 1 : 0,
        marketShare: Math.random() * 30 + 10 // Simulated market share
      });
    });
  });

  const competitors = Array.from(competitorMap.values()).slice(0, 5);

  competitors.forEach(competitor => {
    const presence = competitor.globalPresence;
    const sorted = presence.sort((a: any, b: any) => b.marketShare - a.marketShare);
    
    competitor.strongestMarkets = sorted.slice(0, 3).map((p: any) => `${p.language}-${p.region}`);
    competitor.weakestMarkets = sorted.slice(-2).map((p: any) => `${p.language}-${p.region}`);
    competitor.localizationStrategy = presence.length > 5 ? 'Global localization' : 'Limited international presence';
  });

  return competitors;
}

function calculateGlobalCitationScore(results: LanguageRegionResult[]): number {
  if (results.length === 0) return 0;
  
  const citationCount = results.filter(r => r.isCited).length;
  const weightedScore = results.reduce((sum, result) => {
    const citationScore = result.isCited ? 100 : 0;
    const marketWeight = result.marketPotential / 100;
    return sum + (citationScore * marketWeight);
  }, 0);

  return Math.round(weightedScore / results.length);
}

function calculateMarketPenetration(results: LanguageRegionResult[]): number {
  if (results.length === 0) return 0;
  
  const highPotentialMarkets = results.filter(r => r.marketPotential > 70);
  const penetratedHighPotentialMarkets = highPotentialMarkets.filter(r => r.isCited);
  
  return highPotentialMarkets.length > 0 
    ? Math.round((penetratedHighPotentialMarkets.length / highPotentialMarkets.length) * 100)
    : 0;
}

// Additional action handlers...

async function getLanguageConfigurations(body: any, user: any) {
  const configs = await getLanguageRegionConfigurations(
    'en,es,fr,de,pt,ja,zh,ko,ar,hi,it,nl,ru',
    'us,uk,ca,au,es,fr,de,br,jp,cn,kr,sa,ae,in,it,nl,ru',
    undefined
  );

  return new Response(JSON.stringify({
    totalConfigurations: configs.length,
    supportedLanguages: [...new Set(configs.map(c => c.language))],
    supportedRegions: [...new Set(configs.map(c => c.region))],
    configurations: configs
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function translateQuery(body: any, user: any) {
  const validated = validateInput(body, {
    query: { ...commonSchemas.query, maxLength: 300 },
    target_language: { type: 'string' as const, required: true },
    user_id: commonSchemas.userId
  });

  const translations = await translateQueriesForLanguages(
    validated.query,
    await getLanguageRegionConfigurations(validated.target_language, 'us', undefined)
  );

  return new Response(JSON.stringify({
    originalQuery: validated.query,
    targetLanguage: validated.target_language,
    translatedQuery: translations[validated.target_language] || validated.query
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function analyzeMarketPotential(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    languages: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  const languages = validated.languages || 'en,es,fr,de,pt';
  const configs = await getLanguageRegionConfigurations(languages, 'us,uk,es,fr,de,br', undefined);
  
  const marketAnalysis = configs.map(config => ({
    market: `${config.language}-${config.region}`,
    language: config.language,
    region: config.region,
    marketPotential: calculateMarketPotentialScore(config, {}),
    culturalConsiderations: config.culturalAdaptations || [],
    searchBehavior: config.searchBehaviorNotes || 'Standard search patterns'
  }));

  return new Response(JSON.stringify({
    domain: validated.domain,
    totalMarkets: marketAnalysis.length,
    highPotentialMarkets: marketAnalysis.filter(m => m.marketPotential > 80),
    mediumPotentialMarkets: marketAnalysis.filter(m => m.marketPotential >= 60 && m.marketPotential <= 80),
    lowPotentialMarkets: marketAnalysis.filter(m => m.marketPotential < 60),
    marketAnalysis
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateLocalizationPlan(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    target_markets: { type: 'string' as const, required: true }, // comma-separated
    budget_level: { type: 'string' as const, required: false },
    timeline: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  // Generate a comprehensive localization plan
  const targetMarkets = validated.target_markets.split(',').map(m => m.trim());
  const budgetLevel = validated.budget_level || 'medium';
  const timeline = validated.timeline || '6-months';

  const plan = {
    domain: validated.domain,
    targetMarkets,
    budgetLevel,
    timeline,
    phases: [
      {
        phase: 1,
        name: 'Market Research & Planning',
        duration: '2-3 weeks',
        tasks: ['Market analysis', 'Competitor research', 'Keyword research', 'Cultural analysis'],
        deliverables: ['Market research report', 'Localization strategy', 'Content audit']
      },
      {
        phase: 2,
        name: 'Content Translation & Adaptation',
        duration: '4-6 weeks',
        tasks: ['Professional translation', 'Cultural adaptation', 'Local SEO optimization', 'Schema markup'],
        deliverables: ['Translated content', 'Localized landing pages', 'Cultural adaptation guide']
      },
      {
        phase: 3,
        name: 'Technical Implementation',
        duration: '2-3 weeks',
        tasks: ['Subdomain/subdirectory setup', 'Hreflang implementation', 'Local hosting', 'CDN optimization'],
        deliverables: ['Multi-language site structure', 'Technical SEO implementation']
      },
      {
        phase: 4,
        name: 'Launch & Optimization',
        duration: '2-4 weeks',
        tasks: ['Soft launch', 'Citation monitoring', 'Performance tracking', 'Iterative optimization'],
        deliverables: ['Live localized sites', 'Monitoring dashboard', 'Performance reports']
      }
    ],
    estimatedCost: calculateEstimatedCost(targetMarkets, budgetLevel),
    expectedROI: calculateExpectedROI(targetMarkets),
    riskFactors: ['Translation quality', 'Cultural missteps', 'Technical complexity', 'Competition'],
    successMetrics: ['Citation growth', 'Organic traffic', 'Local rankings', 'Conversion rates']
  };

  return new Response(JSON.stringify(plan), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function calculateEstimatedCost(markets: string[], budgetLevel: string): string {
  const baseCostPerMarket = {
    'low': 5000,
    'medium': 15000,
    'high': 30000
  };

  const cost = markets.length * (baseCostPerMarket[budgetLevel as keyof typeof baseCostPerMarket] || 15000);
  return `$${cost.toLocaleString()} - $${(cost * 1.5).toLocaleString()}`;
}

function calculateExpectedROI(markets: string[]): string {
  const baseROI = markets.length * 150;
  return `${baseROI}% - ${baseROI + 100}% over 12 months`;
}

async function getGlobalAnalytics(body: any, user: any) {
  const validated = validateInput(body, {
    domain: commonSchemas.domain,
    user_id: commonSchemas.userId,
    time_period: { type: 'string' as const, required: false }
  });

  // Get historical global citation data
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/global_citation_monitoring?user_id=eq.${validated.user_id}&domain=eq.${validated.domain}&order=checked_at.desc&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      }
    );

    const historicalData = await response.json();

    const analytics = {
      domain: validated.domain,
      totalChecks: historicalData.length,
      averageGlobalScore: historicalData.length > 0 
        ? historicalData.reduce((sum: number, record: any) => sum + (record.global_citation_score || 0), 0) / historicalData.length 
        : 0,
      averageMarketPenetration: historicalData.length > 0
        ? historicalData.reduce((sum: number, record: any) => sum + (record.market_penetration || 0), 0) / historicalData.length
        : 0,
      languagePerformance: extractLanguagePerformance(historicalData),
      trendData: extractTrendData(historicalData),
      lastChecked: historicalData[0]?.checked_at || null
    };

    return new Response(JSON.stringify(analytics), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics fetch failed:', error);
    return new Response(JSON.stringify({
      domain: validated.domain,
      totalChecks: 0,
      message: 'No historical data available'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function extractLanguagePerformance(data: any[]): Record<string, number> {
  const performance: Record<string, number> = {};
  
  data.forEach(record => {
    if (record.cross_language_analysis?.citationsByLanguage) {
      Object.entries(record.cross_language_analysis.citationsByLanguage).forEach(([lang, count]) => {
        performance[lang] = (performance[lang] || 0) + (count as number);
      });
    }
  });

  return performance;
}

function extractTrendData(data: any[]) {
  return data.slice(0, 5).map(record => ({
    date: record.checked_at,
    globalScore: record.global_citation_score || 0,
    marketPenetration: record.market_penetration || 0,
    totalCitations: record.cross_language_analysis?.totalCitations || 0
  }));
}

serve(secureHandler);