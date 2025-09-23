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
    const { domain, user_id, target_queries = [], competitors = [], comprehensive = false } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Conducting intent-driven research for domain:', domain)
    
    // Generate queries if not provided
    const queriesToAnalyze = target_queries.length > 0 
      ? target_queries 
      : await generateDomainQueries(domain);

    // Simulation gating: AI responses are simulated
    const allowSim = Deno.env.get('ALLOW_SIMULATION') === 'true'
    if (!allowSim) {
      return new Response(JSON.stringify({ error: 'Intent research requires live AI integrations. Simulation is disabled.' }), { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Analyze each query for intent and AI responses (simulated)
    const queryAnalyses = await Promise.all(
      queriesToAnalyze.slice(0, 20).map(query => analyzeQueryIntent(query, domain))
    );

    // Calculate intent distribution
    const intentDistribution = calculateIntentDistribution(queryAnalyses);

    // Generate AI responses analysis
    const aiResponses = await generateAIResponseAnalysis(queriesToAnalyze, domain);

    // Identify content gaps
    const contentGaps = await identifyContentGaps(queryAnalyses, domain, competitors);

    // Create topic clusters
    const topicClusters = createTopicClusters(queryAnalyses, aiResponses);

    // Generate recommendations
    const recommendations = generateContentRecommendations(
      intentDistribution, 
      contentGaps, 
      topicClusters,
      domain
    );

    const research = {
      domain,
      queriesAnalyzed: queriesToAnalyze.length,
      intentDistribution,
      aiResponses,
      contentGaps,
      topicClusters,
      recommendations,
      lastAnalyzed: new Date().toISOString()
    };

    // Store research results
    await storeResearchResults({
      user_id,
      domain,
      research,
      comprehensive
    });

    return new Response(
      JSON.stringify({
        success: true,
        research,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in conduct-intent-research:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateDomainQueries(domain: string): Promise<string[]> {
  const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  
  // Extract business context from domain
  const businessTypes = {
    'shop': ['buy', 'purchase', 'price', 'cost', 'order'],
    'service': ['hire', 'book', 'schedule', 'contact', 'quote'],
    'tech': ['how to', 'tutorial', 'guide', 'setup', 'configure'],
    'health': ['symptoms', 'treatment', 'cure', 'remedy', 'doctor'],
    'finance': ['loan', 'mortgage', 'investment', 'savings', 'budget'],
    'education': ['course', 'learn', 'study', 'certification', 'training']
  };

  let contextKeywords = ['information', 'guide', 'help', 'tips'];
  
  // Determine business context
  for (const [type, keywords] of Object.entries(businessTypes)) {
    if (cleanDomain.includes(type) || domain.includes(type)) {
      contextKeywords = keywords;
      break;
    }
  }

  const queryTemplates = [
    `what is ${cleanDomain}`,
    `how does ${cleanDomain} work`,
    `${cleanDomain} vs competitors`,
    `${cleanDomain} reviews`,
    `${cleanDomain} pricing`,
    `best ${cleanDomain} alternative`,
    `${cleanDomain} features`,
    `${cleanDomain} benefits`,
    `${cleanDomain} problems`,
    `${cleanDomain} comparison`
  ];

  // Add context-specific queries
  contextKeywords.forEach(keyword => {
    queryTemplates.push(`${keyword} for ${cleanDomain}`);
    queryTemplates.push(`${cleanDomain} ${keyword}`);
  });

  return queryTemplates.slice(0, 15);
}

async function analyzeQueryIntent(query: string, domain: string) {
  const queryLower = query.toLowerCase();
  
  // Intent classification based on query patterns
  let intent: 'informational' | 'navigational' | 'transactional' | 'commercial' = 'informational';
  let confidence = 0;
  const indicators: string[] = [];

  // Transactional intent indicators
  const transactionalKeywords = ['buy', 'purchase', 'order', 'book', 'hire', 'download', 'sign up', 'subscribe'];
  if (transactionalKeywords.some(keyword => queryLower.includes(keyword))) {
    intent = 'transactional';
    confidence = 85;
    indicators.push('Contains transactional keywords');
  }

  // Commercial intent indicators
  const commercialKeywords = ['price', 'cost', 'cheap', 'best', 'review', 'comparison', 'vs', 'alternative'];
  if (commercialKeywords.some(keyword => queryLower.includes(keyword))) {
    intent = 'commercial';
    confidence = Math.max(confidence, 80);
    indicators.push('Contains commercial keywords');
  }

  // Navigational intent indicators
  const navigationalKeywords = ['login', 'contact', 'support', 'website', domain.split('.')[0]];
  if (navigationalKeywords.some(keyword => queryLower.includes(keyword))) {
    intent = 'navigational';
    confidence = Math.max(confidence, 90);
    indicators.push('Contains navigational keywords');
  }

  // Informational intent indicators (default)
  const informationalKeywords = ['what', 'how', 'why', 'when', 'where', 'guide', 'tutorial', 'learn'];
  if (informationalKeywords.some(keyword => queryLower.includes(keyword))) {
    intent = 'informational';
    confidence = Math.max(confidence, 75);
    indicators.push('Contains informational keywords');
  }

  // Analyze query structure for additional context
  if (queryLower.includes('?')) {
    indicators.push('Question format');
    confidence += 10;
  }

  if (queryLower.split(' ').length > 5) {
    indicators.push('Long-tail query');
    confidence += 5;
  }

  // Generate suggested content based on intent
  let suggestedContent = '';
  switch (intent) {
    case 'informational':
      suggestedContent = `Create comprehensive guide answering "${query}" with detailed explanations, examples, and related information.`;
      break;
    case 'commercial':
      suggestedContent = `Develop comparison content for "${query}" including pricing, features, pros/cons, and recommendations.`;
      break;
    case 'transactional':
      suggestedContent = `Optimize conversion pages for "${query}" with clear CTAs, pricing, and purchase/signup flows.`;
      break;
    case 'navigational':
      suggestedContent = `Ensure easy navigation and clear paths for "${query}" with prominent links and site structure.`;
      break;
  }

  return {
    query,
    intent,
    confidence: Math.min(confidence, 100),
    indicators,
    suggestedContent
  };
}

function calculateIntentDistribution(analyses: any[]) {
  const distribution = {
    informational: 0,
    navigational: 0,
    transactional: 0,
    commercial: 0
  };

  analyses.forEach(analysis => {
    distribution[analysis.intent]++;
  });

  const total = analyses.length;
  return {
    informational: Math.round((distribution.informational / total) * 100),
    navigational: Math.round((distribution.navigational / total) * 100),
    transactional: Math.round((distribution.transactional / total) * 100),
    commercial: Math.round((distribution.commercial / total) * 100)
  };
}

async function generateAIResponseAnalysis(queries: string[], domain: string) {
  const platforms = ['ChatGPT', 'Claude', 'Perplexity', 'Gemini'];
  const responses = [];

  // Analyze a subset of queries across platforms
  for (const query of queries.slice(0, 8)) {
    for (const platform of platforms.slice(0, 2)) { // Limit to 2 platforms for performance
      const response = await simulateAIResponse(platform, query, domain);
      responses.push(response);
    }
  }

  return responses;
}

async function simulateAIResponse(platform: string, query: string, domain: string) {
  // Extract domain name for analysis
  const domainName = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0];
  
  // Generate realistic AI response simulation
  const responseTemplates = [
    `Based on the available information, ${query.toLowerCase()} involves several key aspects that users should understand.`,
    `When considering ${query.toLowerCase()}, there are multiple factors and approaches to consider.`,
    `The topic of ${query.toLowerCase()} encompasses various elements that are important for comprehensive understanding.`,
    `To address ${query.toLowerCase()}, it's essential to examine the different components and their relationships.`
  ];

  const response = responseTemplates[Math.floor(Math.random() * responseTemplates.length)];
  const responseLength = 150 + Math.floor(Math.random() * 200);
  const extendedResponse = response + ' ' + generateAdditionalContent(query, responseLength - response.length);

  // Determine if domain would be cited
  const domainAuthority = calculateDomainAuthority(domain);
  const queryRelevance = query.toLowerCase().includes(domainName.toLowerCase()) ? 0.8 : 0.3;
  const citationProbability = Math.min(0.9, domainAuthority + queryRelevance * 0.4);
  
  const citedSources = Math.random() < citationProbability 
    ? [`https://${domain}`, 'https://wikipedia.org', 'https://example-authority.com']
    : ['https://wikipedia.org', 'https://example-authority.com'];

  // Extract key topics from query
  const keyTopics = extractKeyTopics(query);

  // Identify content gaps and opportunities
  const gaps = identifyQueryGaps(query, domain);
  const opportunities = identifyQueryOpportunities(query, domain);

  return {
    platform,
    query,
    response: extendedResponse,
    citedSources,
    responseLength: extendedResponse.length,
    keyTopics,
    gaps,
    opportunities
  };
}

function generateAdditionalContent(query: string, targetLength: number): string {
  const queryWords = query.toLowerCase().split(' ');
  const contentElements = [
    'This involves understanding the fundamental principles and their practical applications.',
    'Key considerations include timing, methodology, and expected outcomes.',
    'Industry best practices suggest a systematic approach to implementation.',
    'Research indicates that proper planning significantly improves results.',
    'Expert recommendations emphasize the importance of thorough preparation.'
  ];

  let content = '';
  while (content.length < targetLength && contentElements.length > 0) {
    const element = contentElements.shift();
    content += element + ' ';
  }

  return content.trim().substring(0, targetLength);
}

function calculateDomainAuthority(domain: string): number {
  // Simulate domain authority based on domain characteristics
  if (domain.includes('.gov')) return 0.9;
  if (domain.includes('.edu')) return 0.8;
  if (domain.includes('.org')) return 0.6;
  
  // Consider domain age and structure indicators
  const domainParts = domain.split('.');
  if (domainParts[0].length < 8) return 0.7; // Short domains often have higher authority
  if (domainParts[0].includes('-')) return 0.4; // Hyphenated domains typically lower
  
  return 0.5; // Default authority
}

function extractKeyTopics(query: string): string[] {
  const words = query.toLowerCase().split(' ').filter(word => word.length > 3);
  const stopWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'that', 'this', 'with', 'from', 'they', 'have', 'been'];
  
  return words
    .filter(word => !stopWords.includes(word))
    .slice(0, 5);
}

function identifyQueryGaps(query: string, domain: string): string[] {
  const gaps = [
    'Lack of specific examples and case studies',
    'Missing step-by-step implementation guidance',
    'Insufficient comparison with alternatives',
    'Limited coverage of common challenges'
  ];

  return gaps.slice(0, 2 + Math.floor(Math.random() * 2));
}

function identifyQueryOpportunities(query: string, domain: string): string[] {
  const opportunities = [
    'Create comprehensive FAQ section',
    'Develop detailed tutorial content',
    'Add interactive tools or calculators',
    'Include customer testimonials and reviews',
    'Provide downloadable resources',
    'Create video explanations'
  ];

  return opportunities.slice(0, 2 + Math.floor(Math.random() * 3));
}

async function identifyContentGaps(queryAnalyses: any[], domain: string, competitors: string[]) {
  const gaps = [];
  
  // Analyze each query for content opportunities
  for (const analysis of queryAnalyses.slice(0, 10)) {
    const searchVolume = 1000 + Math.floor(Math.random() * 5000);
    const currentCoverage = Math.floor(Math.random() * 60) + 20; // 20-80% coverage
    const estimatedTraffic = Math.floor(searchVolume * (0.1 + Math.random() * 0.2));

    gaps.push({
      topic: analysis.query,
      gap: `Limited content addressing user intent for "${analysis.query}". Opportunity to create ${analysis.intent} content.`,
      priority: analysis.confidence > 80 ? 'high' : analysis.confidence > 60 ? 'medium' : 'low',
      searchVolume,
      currentCoverage,
      suggestedContent: analysis.suggestedContent,
      estimatedTraffic
    });
  }

  // Sort by priority and estimated traffic
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return b.estimatedTraffic - a.estimatedTraffic;
  }).slice(0, 8);
}

function createTopicClusters(queryAnalyses: any[], aiResponses: any[]) {
  // Extract topics from queries and responses
  const allTopics = [
    ...queryAnalyses.flatMap(qa => extractKeyTopics(qa.query)),
    ...aiResponses.flatMap(ar => ar.keyTopics)
  ];

  // Count topic frequency
  const topicCounts = allTopics.reduce((acc, topic) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group related topics into clusters
  const topicEntries = Object.entries(topicCounts).sort(([,a], [,b]) => b - a);
  const clusters = [];

  // Create clusters for top topics
  for (let i = 0; i < topicEntries.length; i += 3) {
    const clusterTopics = topicEntries.slice(i, i + 3);
    if (clusterTopics.length === 0) break;

    const mainTopic = clusterTopics[0][0];
    const relatedTopics = clusterTopics.map(([topic]) => topic);
    
    clusters.push({
      cluster: `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Content Cluster`,
      topics: relatedTopics,
      coverage: 40 + Math.floor(Math.random() * 40), // 40-80% coverage
      opportunity: 60 + Math.floor(Math.random() * 30) // 60-90% opportunity
    });

    if (clusters.length >= 6) break;
  }

  return clusters;
}

function generateContentRecommendations(
  intentDistribution: any,
  contentGaps: any[],
  topicClusters: any[],
  domain: string
) {
  const recommendations = [];

  // Intent-based recommendations
  if (intentDistribution.informational > 40) {
    recommendations.push({
      type: 'Content Strategy',
      title: 'Expand Educational Content',
      description: 'High informational intent queries suggest need for comprehensive guides, tutorials, and explanatory content.',
      priority: 'high',
      estimatedImpact: '30-50% traffic increase'
    });
  }

  if (intentDistribution.commercial > 30) {
    recommendations.push({
      type: 'Conversion Optimization',
      title: 'Create Comparison Content',
      description: 'Significant commercial intent indicates opportunity for comparison pages, reviews, and buying guides.',
      priority: 'high',
      estimatedImpact: '20-40% conversion increase'
    });
  }

  if (intentDistribution.transactional > 20) {
    recommendations.push({
      type: 'Landing Pages',
      title: 'Optimize Conversion Funnels',
      description: 'Transactional queries show ready-to-buy users. Focus on clear CTAs and streamlined purchase flows.',
      priority: 'medium',
      estimatedImpact: '15-25% conversion improvement'
    });
  }

  // Gap-based recommendations
  const highPriorityGaps = contentGaps.filter(gap => gap.priority === 'high');
  if (highPriorityGaps.length > 0) {
    recommendations.push({
      type: 'Content Creation',
      title: 'Address High-Priority Content Gaps',
      description: `${highPriorityGaps.length} high-priority content gaps identified with significant traffic potential.`,
      priority: 'high',
      estimatedImpact: '40-70% organic traffic increase'
    });
  }

  // Cluster-based recommendations
  const lowCoverageClusters = topicClusters.filter(cluster => cluster.coverage < 60);
  if (lowCoverageClusters.length > 0) {
    recommendations.push({
      type: 'Topic Authority',
      title: 'Build Topic Cluster Authority',
      description: `${lowCoverageClusters.length} topic clusters have low coverage but high opportunity for authority building.`,
      priority: 'medium',
      estimatedImpact: '25-45% visibility improvement'
    });
  }

  // AI-specific recommendations
  recommendations.push({
    type: 'AI Optimization',
    title: 'Optimize for AI Platform Citations',
    description: 'Structure content with clear answers, FAQ formats, and authoritative sources to increase AI platform citations.',
    priority: 'medium',
    estimatedImpact: '30-50% AI visibility increase'
  });

  return recommendations.slice(0, 6);
}

async function storeResearchResults(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/intent_research_results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        domain: data.domain,
        queries_analyzed: data.research.queriesAnalyzed,
        intent_distribution: data.research.intentDistribution,
        ai_responses: data.research.aiResponses,
        content_gaps: data.research.contentGaps,
        topic_clusters: data.research.topicClusters,
        recommendations: data.research.recommendations,
        comprehensive: data.comprehensive,
        analyzed_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store research results:', error);
  }
}