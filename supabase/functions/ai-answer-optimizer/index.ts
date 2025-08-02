import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

interface OptimizationSuggestion {
  type: 'structure' | 'content' | 'format' | 'authority';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  impact: number; // 1-100
}

interface OptimizedContent {
  originalLength: number;
  optimizedLength: number;
  structureChanges: string[];
  contentAdditions: string[];
  formatImprovements: string[];
  authorityEnhancements: string[];
  readabilityScore: number;
  citationPotentialScore: number;
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const validated = validateInput(body, {
      content: { type: 'string' as const, required: true, minLength: 100, maxLength: 50000 },
      target_query: { type: 'string' as const, required: true, maxLength: 500 },
      domain: commonSchemas.domain,
      user_id: commonSchemas.userId,
      optimization_level: { type: 'string' as const, required: false }, // basic, advanced, aggressive
      content_type: { type: 'string' as const, required: false } // article, faq, howto, review
    });

    const {
      content,
      target_query,
      domain,
      user_id,
      optimization_level = 'advanced',
      content_type = 'article'
    } = validated;

    console.log('Optimizing content for AI answers:', { target_query, domain, optimization_level });

    const cacheKey = generateCacheKey('ai-optimizer', target_query, content.substring(0, 100), optimization_level);
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const performOptimization = withPerformanceMonitoring(async () => {
      // Step 1: Analyze current content
      const contentAnalysis = analyzeContent(content, target_query);
      
      // Step 2: Get AI optimization suggestions
      const suggestions = await generateOptimizationSuggestions(
        content, 
        target_query, 
        domain, 
        optimization_level,
        content_type
      );

      // Step 3: Generate optimized content structure
      const optimizedContent = await generateOptimizedContent(
        content,
        target_query,
        suggestions,
        content_type
      );

      return {
        target_query,
        domain,
        original_content: content,
        content_analysis: contentAnalysis,
        suggestions,
        optimized_content: optimizedContent,
        optimization_level,
        content_type,
        optimized_at: new Date().toISOString()
      };
    }, 'ai-content-optimization');

    const results = await performOptimization();

    // Store optimization results
    const storeResults = withPerformanceMonitoring(async () => {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const dbPayload = {
        user_id,
        target_query,
        domain,
        original_content: content,
        optimization_suggestions: results.suggestions,
        optimized_content: results.optimized_content,
        optimization_level,
        content_type,
        optimized_at: results.optimized_at
      };

      await fetch(`${supabaseUrl}/rest/v1/content_optimizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify(dbPayload),
      }).catch(err => console.error('DB insert failed:', err));

      return results;
    }, 'optimization-db-store');

    const finalResults = await storeResults();
    setCached(cacheKey, finalResults, 1800000); // 30 minute cache

    return new Response(JSON.stringify(finalResults), {
      headers: { 'Content-Type': 'application/json' }
    });
  },
  {
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 3600000 }, // 20 requests per hour
    maxRequestSize: 102400, // 100KB max request
    allowedOrigins: ['*']
  }
);

function analyzeContent(content: string, targetQuery: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim());
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
  
  // Check for key elements AI answers prefer
  const hasNumberedList = /\d+\.\s/.test(content);
  const hasBulletPoints = /[•\-\*]\s/.test(content);
  const hasHeadings = /#+ |<h[1-6]/.test(content);
  const hasDefinition = content.toLowerCase().includes(targetQuery.toLowerCase());
  const hasStatistics = /\d+%|\d+\s*(percent|million|billion|thousand)/.test(content);
  
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgWordsPerSentence: words.length / sentences.length,
    avgSentencesPerParagraph: sentences.length / paragraphs.length,
    hasStructuredLists: hasNumberedList || hasBulletPoints,
    hasHeadings,
    hasDefinition,
    hasStatistics,
    readabilityScore: calculateReadabilityScore(content),
    queryAlignment: calculateQueryAlignment(content, targetQuery)
  };
}

async function generateOptimizationSuggestions(
  content: string, 
  targetQuery: string, 
  domain: string, 
  level: string,
  contentType: string
): Promise<OptimizationSuggestion[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const prompt = `As an AI search optimization expert, analyze this content and provide specific suggestions to improve its chances of being cited in AI answers.

TARGET QUERY: "${targetQuery}"
DOMAIN: ${domain}
CONTENT TYPE: ${contentType}
OPTIMIZATION LEVEL: ${level}

CONTENT:
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Provide optimization suggestions as JSON array with this structure:
[
  {
    "type": "structure|content|format|authority",
    "priority": "high|medium|low",
    "title": "Brief title",
    "description": "What needs to be changed",
    "implementation": "Specific steps to implement",
    "impact": 85
  }
]

Focus on:
- Direct answers to the query in the first paragraph
- Structured format (lists, headings, definitions)
- Statistical data and authoritative sources
- Clear, concise explanations
- FAQ-style sections for common questions
- Schema markup opportunities

Provide 5-8 actionable suggestions ranked by impact.`;

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
        max_tokens: 1200,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const suggestionsText = data.choices[0]?.message?.content || '';
    
    try {
      return JSON.parse(suggestionsText);
    } catch (parseError) {
      console.error('Failed to parse AI suggestions:', parseError);
      return generateFallbackSuggestions(targetQuery, contentType);
    }
  } catch (error) {
    console.error('AI suggestions failed:', error);
    return generateFallbackSuggestions(targetQuery, contentType);
  }
}

async function generateOptimizedContent(
  originalContent: string,
  targetQuery: string,
  suggestions: OptimizationSuggestion[],
  contentType: string
): Promise<OptimizedContent> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
  const suggestionText = highPrioritySuggestions.map(s => 
    `${s.title}: ${s.implementation}`
  ).join('\n');

  const prompt = `Rewrite this content to be optimized for AI search citations. Apply these high-priority suggestions:

${suggestionText}

TARGET QUERY: "${targetQuery}"
CONTENT TYPE: ${contentType}

ORIGINAL CONTENT:
${originalContent.substring(0, 3000)}${originalContent.length > 3000 ? '...' : ''}

Requirements:
1. Start with a direct, concise answer to the query
2. Use clear headings and subheadings
3. Include numbered lists or bullet points where appropriate
4. Add statistical data where relevant
5. Maintain factual accuracy
6. Keep the same core information but restructure for AI consumption
7. Aim for 500-1500 words depending on complexity

Return the optimized content in this JSON format:
{
  "optimized_text": "The rewritten content",
  "structure_changes": ["Added FAQ section", "Reorganized with clear headings"],
  "content_additions": ["Added statistics", "Included definitions"],
  "format_improvements": ["Used numbered lists", "Added summary box"],
  "authority_enhancements": ["Referenced authoritative sources", "Added citations"],
  "readability_score": 85,
  "citation_potential_score": 90
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
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const optimizedText = data.choices[0]?.message?.content || '';
    
    try {
      const parsed = JSON.parse(optimizedText);
      return {
        originalLength: originalContent.length,
        optimizedLength: parsed.optimized_text.length,
        ...parsed
      };
    } catch (parseError) {
      console.error('Failed to parse optimized content:', parseError);
      return generateFallbackOptimization(originalContent, targetQuery);
    }
  } catch (error) {
    console.error('Content optimization failed:', error);
    return generateFallbackOptimization(originalContent, targetQuery);
  }
}

function generateFallbackSuggestions(targetQuery: string, contentType: string): OptimizationSuggestion[] {
  return [
    {
      type: 'structure',
      priority: 'high',
      title: 'Add Direct Answer',
      description: 'Start with a clear, concise answer to the target query',
      implementation: `Begin with: "The answer to '${targetQuery}' is..."`,
      impact: 90
    },
    {
      type: 'format',
      priority: 'high',
      title: 'Use Structured Lists',
      description: 'Convert key points into numbered or bulleted lists',
      implementation: 'Break down complex information into easy-to-scan lists',
      impact: 80
    },
    {
      type: 'content',
      priority: 'medium',
      title: 'Add Statistics',
      description: 'Include relevant data and statistics',
      implementation: 'Research and add current statistics related to the topic',
      impact: 70
    },
    {
      type: 'authority',
      priority: 'medium',
      title: 'Add Source Citations',
      description: 'Include authoritative sources and references',
      implementation: 'Link to reputable sources that support your claims',
      impact: 75
    }
  ];
}

function generateFallbackOptimization(originalContent: string, targetQuery: string): OptimizedContent {
  return {
    originalLength: originalContent.length,
    optimizedLength: originalContent.length,
    optimized_text: `Direct Answer: ${targetQuery}\n\n${originalContent}\n\nKey Points:\n• Main benefit 1\n• Main benefit 2\n• Main benefit 3`,
    structureChanges: ['Added direct answer', 'Added key points summary'],
    contentAdditions: ['Included query-focused introduction'],
    formatImprovements: ['Added bullet points'],
    authorityEnhancements: ['Structured for authority'],
    readabilityScore: 75,
    citationPotentialScore: 65
  };
}

function calculateReadabilityScore(content: string): number {
  const words = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim()).length;
  const avgWordsPerSentence = words / sentences;
  
  if (avgWordsPerSentence < 15) return 90;
  if (avgWordsPerSentence < 20) return 80;
  if (avgWordsPerSentence < 25) return 70;
  return 60;
}

function calculateQueryAlignment(content: string, query: string): number {
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);
  
  let matches = 0;
  queryWords.forEach(word => {
    if (contentLower.includes(word)) matches++;
  });
  
  return (matches / queryWords.length) * 100;
}

serve(secureHandler);