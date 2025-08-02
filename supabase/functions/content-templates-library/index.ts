import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSecureHandler, validateInput, commonSchemas, validateEnvVars } from "../_shared/security.ts";
import { getCached, setCached, generateCacheKey, withPerformanceMonitoring, retryWithBackoff } from "../_shared/performance.ts";

validateEnvVars(['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']);

interface ContentTemplate {
  id: string;
  name: string;
  category: 'how-to' | 'comparison' | 'list' | 'FAQ' | 'review' | 'guide' | 'news' | 'opinion';
  contentType: 'article' | 'blog-post' | 'product-page' | 'landing-page' | 'FAQ-page' | 'resource-page';
  structure: TemplateSection[];
  citationOptimizations: CitationOptimization[];
  aiPrompts: AIPrompt[];
  schemaMarkup?: string;
  estimatedCitationPotential: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordCountRange: [number, number];
  tags: string[];
  examples: string[];
  createdAt: string;
}

interface TemplateSection {
  id: string;
  title: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'statistic' | 'definition' | 'example' | 'conclusion';
  content: string;
  citationHooks: string[];
  aiInstructions: string;
  required: boolean;
  order: number;
}

interface CitationOptimization {
  technique: string;
  description: string;
  example: string;
  effectiveness: number; // 1-100
  applicableTypes: string[];
}

interface AIPrompt {
  section: string;
  prompt: string;
  variables: string[];
  expectedOutput: string;
}

interface CustomTemplate {
  topic: string;
  targetKeywords: string[];
  contentGoals: string[];
  audienceLevel: 'beginner' | 'intermediate' | 'expert';
  wordCount: number;
  includeSchema: boolean;
  citationStyle: 'academic' | 'journalistic' | 'conversational' | 'authoritative';
}

const secureHandler = createSecureHandler(
  async (req: Request, user: any) => {
    const body = await req.json();
    const action = body.action || 'get_templates';

    switch (action) {
      case 'get_templates':
        return await getTemplateLibrary(body, user);
      case 'get_template':
        return await getTemplate(body, user);
      case 'generate_custom':
        return await generateCustomTemplate(body, user);
      case 'create_content':
        return await createContentFromTemplate(body, user);
      case 'save_template':
        return await saveUserTemplate(body, user);
      case 'get_categories':
        return await getTemplateCategories(body, user);
      default:
        throw new Error('Invalid action');
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 50, windowMs: 3600000 }, // 50 requests per hour
    maxRequestSize: 51200, // 50KB for content generation
    allowedOrigins: ['*']
  }
);

async function getTemplateLibrary(body: any, user: any) {
  const validated = validateInput(body, {
    category: { type: 'string' as const, required: false },
    content_type: { type: 'string' as const, required: false },
    difficulty: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  const { category, content_type, difficulty, user_id } = validated;

  const cacheKey = generateCacheKey('content-templates', category || 'all', content_type || 'all', difficulty || 'all');
  const cached = getCached(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const performLibraryRetrieval = withPerformanceMonitoring(async () => {
    // Get built-in templates
    const builtInTemplates = await getBuiltInTemplates();
    
    // Get user-saved templates
    const userTemplates = await getUserSavedTemplates(user_id);
    
    // Filter by criteria
    let filteredTemplates = [...builtInTemplates, ...userTemplates];
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (content_type) {
      filteredTemplates = filteredTemplates.filter(t => t.contentType === content_type);
    }
    
    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty);
    }

    // Sort by citation potential
    filteredTemplates.sort((a, b) => b.estimatedCitationPotential - a.estimatedCitationPotential);

    return {
      total: filteredTemplates.length,
      templates: filteredTemplates,
      categories: getUniqueValues(builtInTemplates, 'category'),
      contentTypes: getUniqueValues(builtInTemplates, 'contentType'),
      difficulties: getUniqueValues(builtInTemplates, 'difficulty'),
      retrievedAt: new Date().toISOString()
    };
  }, 'template-library-retrieval');

  const results = await performLibraryRetrieval();
  setCached(cacheKey, results, 1800000); // 30 minute cache

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getBuiltInTemplates(): Promise<ContentTemplate[]> {
  return [
    {
      id: 'ultimate-guide-template',
      name: 'Ultimate Guide Template',
      category: 'guide',
      contentType: 'article',
      structure: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'paragraph',
          content: 'Hook readers with a compelling problem statement and overview of what they\'ll learn.',
          citationHooks: ['industry statistics', 'expert quotes', 'recent studies'],
          aiInstructions: 'Start with a surprising statistic or common pain point. Define the topic clearly and preview the comprehensive coverage.',
          required: true,
          order: 1
        },
        {
          id: 'what-is',
          title: 'What is [Topic]?',
          type: 'definition',
          content: 'Comprehensive definition with context and background.',
          citationHooks: ['authoritative definitions', 'historical context', 'expert perspectives'],
          aiInstructions: 'Provide a clear, authoritative definition that goes beyond basic explanations. Include etymology or historical development if relevant.',
          required: true,
          order: 2
        },
        {
          id: 'why-important',
          title: 'Why [Topic] Matters',
          type: 'paragraph',
          content: 'Explain the significance, benefits, and real-world impact.',
          citationHooks: ['research findings', 'case studies', 'industry trends'],
          aiInstructions: 'Connect the topic to bigger trends, business outcomes, or life improvements. Use specific examples and data.',
          required: true,
          order: 3
        },
        {
          id: 'complete-breakdown',
          title: 'Complete Breakdown',
          type: 'list',
          content: 'Detailed step-by-step coverage of all aspects.',
          citationHooks: ['methodology sources', 'best practices', 'expert recommendations'],
          aiInstructions: 'Break down complex topics into digestible sub-topics. Each should be comprehensive enough to stand alone.',
          required: true,
          order: 4
        },
        {
          id: 'common-mistakes',
          title: 'Common Mistakes to Avoid',
          type: 'list',
          content: 'Pitfalls and how to avoid them.',
          citationHooks: ['failure case studies', 'expert warnings', 'research on errors'],
          aiInstructions: 'Focus on mistakes that are both common and costly. Explain why they happen and how to prevent them.',
          required: false,
          order: 5
        },
        {
          id: 'advanced-tips',
          title: 'Advanced Tips & Strategies',
          type: 'list',
          content: 'Professional-level insights and techniques.',
          citationHooks: ['expert interviews', 'advanced studies', 'cutting-edge research'],
          aiInstructions: 'Share insights that go beyond basics. Include techniques used by top practitioners.',
          required: false,
          order: 6
        },
        {
          id: 'tools-resources',
          title: 'Essential Tools & Resources',
          type: 'list',
          content: 'Recommended tools, software, and additional resources.',
          citationHooks: ['tool comparisons', 'user reviews', 'expert recommendations'],
          aiInstructions: 'Recommend specific, actionable tools. Include both free and premium options with brief explanations.',
          required: false,
          order: 7
        },
        {
          id: 'conclusion',
          title: 'Key Takeaways',
          type: 'conclusion',
          content: 'Summarize main points and provide next steps.',
          citationHooks: ['summary statistics', 'future trends', 'expert predictions'],
          aiInstructions: 'Reinforce the most important points and give readers clear next steps. End with motivation or a forward-looking statement.',
          required: true,
          order: 8
        }
      ],
      citationOptimizations: [
        {
          technique: 'Authoritative Opening',
          description: 'Start with a credible statistic or expert quote',
          example: 'According to a 2024 study by [Authority], 73% of companies report...',
          effectiveness: 85,
          applicableTypes: ['introduction', 'statistic']
        },
        {
          technique: 'Source Attribution',
          description: 'Clearly attribute all claims to credible sources',
          example: 'As noted in the Harvard Business Review research...',
          effectiveness: 90,
          applicableTypes: ['paragraph', 'quote']
        },
        {
          technique: 'Data Integration',
          description: 'Weave statistics naturally into explanations',
          example: 'This approach has shown a 45% improvement rate (Source: Industry Report 2024)',
          effectiveness: 80,
          applicableTypes: ['statistic', 'example']
        }
      ],
      aiPrompts: [
        {
          section: 'introduction',
          prompt: 'Write an engaging introduction for an ultimate guide about {TOPIC}. Start with a compelling statistic about {TOPIC} and explain why this guide will be valuable. Keep it under 150 words.',
          variables: ['TOPIC'],
          expectedOutput: 'Hook + problem statement + guide overview'
        },
        {
          section: 'definition',
          prompt: 'Provide a comprehensive definition of {TOPIC} that goes beyond basic explanations. Include background context and why understanding this concept is important. Target 200-250 words.',
          variables: ['TOPIC'],
          expectedOutput: 'Authoritative definition with context'
        }
      ],
      schemaMarkup: 'Article',
      estimatedCitationPotential: 92,
      difficulty: 'intermediate',
      wordCountRange: [3000, 5000],
      tags: ['comprehensive', 'authoritative', 'reference', 'evergreen'],
      examples: ['Ultimate Guide to SEO', 'Complete Digital Marketing Guide', 'Comprehensive Project Management Guide'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'comparison-template',
      name: 'Detailed Comparison Template',
      category: 'comparison',
      contentType: 'article',
      structure: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'paragraph',
          content: 'Establish the comparison context and why it matters.',
          citationHooks: ['market data', 'user surveys', 'industry trends'],
          aiInstructions: 'Frame the comparison problem and explain why readers need this information.',
          required: true,
          order: 1
        },
        {
          id: 'quick-comparison',
          title: 'Quick Comparison Table',
          type: 'list',
          content: 'High-level feature/benefit comparison in table format.',
          citationHooks: ['official specifications', 'verified features', 'pricing data'],
          aiInstructions: 'Create a clear comparison table focusing on the most important differentiators.',
          required: true,
          order: 2
        },
        {
          id: 'detailed-analysis',
          title: 'Detailed Analysis',
          type: 'paragraph',
          content: 'In-depth breakdown of each option.',
          citationHooks: ['expert reviews', 'user testimonials', 'performance data'],
          aiInstructions: 'Provide unbiased analysis of each option\'s strengths and weaknesses.',
          required: true,
          order: 3
        },
        {
          id: 'use-cases',
          title: 'Best Use Cases',
          type: 'list',
          content: 'When to choose each option.',
          citationHooks: ['case studies', 'expert recommendations', 'user scenarios'],
          aiInstructions: 'Give specific scenarios where each option excels.',
          required: true,
          order: 4
        },
        {
          id: 'verdict',
          title: 'Final Verdict',
          type: 'conclusion',
          content: 'Clear recommendation based on different needs.',
          citationHooks: ['summarized research', 'expert consensus', 'user feedback'],
          aiInstructions: 'Provide clear, actionable recommendations for different user types.',
          required: true,
          order: 5
        }
      ],
      citationOptimizations: [
        {
          technique: 'Objective Data',
          description: 'Use neutral, verifiable data points for comparisons',
          example: 'Platform A processes 50% more requests per second (benchmark data)',
          effectiveness: 88,
          applicableTypes: ['statistic', 'list']
        },
        {
          technique: 'Multiple Sources',
          description: 'Reference multiple independent sources for claims',
          example: 'Both TechCrunch and Wired report similar performance metrics...',
          effectiveness: 85,
          applicableTypes: ['paragraph', 'quote']
        }
      ],
      aiPrompts: [
        {
          section: 'comparison-table',
          prompt: 'Create a comparison table for {OPTION_A} vs {OPTION_B} focusing on {KEY_FEATURES}. Include pricing, key features, and target users. Format as markdown table.',
          variables: ['OPTION_A', 'OPTION_B', 'KEY_FEATURES'],
          expectedOutput: 'Structured comparison table'
        }
      ],
      estimatedCitationPotential: 85,
      difficulty: 'intermediate',
      wordCountRange: [2000, 3500],
      tags: ['comparison', 'decision-making', 'unbiased', 'practical'],
      examples: ['Shopify vs WooCommerce', 'iPhone vs Android', 'AWS vs Azure Comparison'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'how-to-template',
      name: 'Step-by-Step How-To Template',
      category: 'how-to',
      contentType: 'article',
      structure: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'paragraph',
          content: 'Explain what readers will accomplish and prerequisites.',
          citationHooks: ['success statistics', 'expert endorsements', 'research benefits'],
          aiInstructions: 'Set clear expectations and motivate readers with the end result.',
          required: true,
          order: 1
        },
        {
          id: 'requirements',
          title: 'What You\'ll Need',
          type: 'list',
          content: 'Tools, skills, and materials required.',
          citationHooks: ['tool specifications', 'expert recommendations', 'official requirements'],
          aiInstructions: 'List everything needed upfront to prevent mid-process surprises.',
          required: true,
          order: 2
        },
        {
          id: 'step-by-step',
          title: 'Step-by-Step Instructions',
          type: 'list',
          content: 'Clear, actionable steps with explanations.',
          citationHooks: ['methodology sources', 'best practices', 'expert techniques'],
          aiInstructions: 'Make each step clear and actionable. Include why each step matters.',
          required: true,
          order: 3
        },
        {
          id: 'troubleshooting',
          title: 'Troubleshooting Common Issues',
          type: 'list',
          content: 'Solutions for likely problems.',
          citationHooks: ['support documentation', 'community solutions', 'expert fixes'],
          aiInstructions: 'Address the most common failure points with clear solutions.',
          required: false,
          order: 4
        },
        {
          id: 'next-steps',
          title: 'Next Steps & Advanced Tips',
          type: 'paragraph',
          content: 'What to do after completing the basic process.',
          citationHooks: ['advanced tutorials', 'expert recommendations', 'optimization studies'],
          aiInstructions: 'Help readers continue their journey with advanced techniques or related topics.',
          required: false,
          order: 5
        }
      ],
      citationOptimizations: [
        {
          technique: 'Method Attribution',
          description: 'Credit the original method or expert who developed it',
          example: 'This technique, developed by Dr. Smith at MIT, involves...',
          effectiveness: 80,
          applicableTypes: ['paragraph', 'list']
        },
        {
          technique: 'Success Rate Data',
          description: 'Include statistics on method effectiveness',
          example: 'Users following this method report 85% success rates (Survey, 2024)',
          effectiveness: 75,
          applicableTypes: ['statistic', 'example']
        }
      ],
      aiPrompts: [
        {
          section: 'step-instructions',
          prompt: 'Write detailed step-by-step instructions for {PROCESS}. Each step should be clear, actionable, and include brief explanations of why it\'s important. Target {NUM_STEPS} main steps.',
          variables: ['PROCESS', 'NUM_STEPS'],
          expectedOutput: 'Numbered step list with explanations'
        }
      ],
      estimatedCitationPotential: 78,
      difficulty: 'beginner',
      wordCountRange: [1500, 2500],
      tags: ['tutorial', 'actionable', 'practical', 'beginner-friendly'],
      examples: ['How to Set Up Google Analytics', 'How to Create a Budget', 'How to Start a Blog'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq-template',
      name: 'Comprehensive FAQ Template',
      category: 'FAQ',
      contentType: 'FAQ-page',
      structure: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'paragraph',
          content: 'Brief overview of the topic and what questions are covered.',
          citationHooks: ['common question statistics', 'survey data', 'support ticket analysis'],
          aiInstructions: 'Set context for why these questions matter and how comprehensive the answers are.',
          required: true,
          order: 1
        },
        {
          id: 'basic-questions',
          title: 'Basic Questions',
          type: 'list',
          content: 'Foundational questions everyone asks.',
          citationHooks: ['authoritative definitions', 'official documentation', 'expert explanations'],
          aiInstructions: 'Answer fundamental questions that build understanding.',
          required: true,
          order: 2
        },
        {
          id: 'advanced-questions',
          title: 'Advanced Questions',
          type: 'list',
          content: 'Complex scenarios and edge cases.',
          citationHooks: ['expert insights', 'advanced studies', 'specialist knowledge'],
          aiInstructions: 'Address nuanced questions that experienced users have.',
          required: false,
          order: 3
        },
        {
          id: 'technical-questions',
          title: 'Technical Questions',
          type: 'list',
          content: 'Implementation and technical details.',
          citationHooks: ['technical documentation', 'developer resources', 'specification details'],
          aiInstructions: 'Provide precise technical answers with implementation details.',
          required: false,
          order: 4
        }
      ],
      citationOptimizations: [
        {
          technique: 'Official Source Priority',
          description: 'Always reference official documentation first',
          example: 'According to the official API documentation...',
          effectiveness: 90,
          applicableTypes: ['definition', 'paragraph']
        },
        {
          technique: 'Expert Consensus',
          description: 'Show agreement among multiple experts',
          example: 'Industry experts consistently recommend...',
          effectiveness: 82,
          applicableTypes: ['paragraph', 'quote']
        }
      ],
      aiPrompts: [
        {
          section: 'faq-generation',
          prompt: 'Generate {NUM_QUESTIONS} frequently asked questions about {TOPIC} with comprehensive answers. Include both beginner and advanced questions. Format as Q&A pairs.',
          variables: ['NUM_QUESTIONS', 'TOPIC'],
          expectedOutput: 'Q&A formatted content'
        }
      ],
      schemaMarkup: 'FAQPage',
      estimatedCitationPotential: 88,
      difficulty: 'beginner',
      wordCountRange: [2000, 4000],
      tags: ['FAQ', 'comprehensive', 'reference', 'user-focused'],
      examples: ['SEO FAQ', 'WordPress FAQ', 'Digital Marketing FAQ'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'list-template',
      name: 'Authority List Template',
      category: 'list',
      contentType: 'article',
      structure: [
        {
          id: 'intro',
          title: 'Introduction',
          type: 'paragraph',
          content: 'Explain the list criteria and methodology.',
          citationHooks: ['selection criteria', 'research methodology', 'expert input'],
          aiInstructions: 'Establish credibility by explaining how items were selected and vetted.',
          required: true,
          order: 1
        },
        {
          id: 'methodology',
          title: 'Our Selection Process',
          type: 'paragraph',
          content: 'Detailed explanation of evaluation criteria.',
          citationHooks: ['evaluation frameworks', 'industry standards', 'expert criteria'],
          aiInstructions: 'Build trust by showing rigorous selection methodology.',
          required: true,
          order: 2
        },
        {
          id: 'top-items',
          title: 'The Complete List',
          type: 'list',
          content: 'Ranked or categorized items with detailed explanations.',
          citationHooks: ['item specifications', 'user reviews', 'expert ratings', 'performance data'],
          aiInstructions: 'Provide substantive information for each item, not just brief descriptions.',
          required: true,
          order: 3
        },
        {
          id: 'honorable-mentions',
          title: 'Honorable Mentions',
          type: 'list',
          content: 'Items that almost made the list.',
          citationHooks: ['alternative options', 'niche recommendations', 'emerging solutions'],
          aiInstructions: 'Include worthy alternatives that serve specific use cases.',
          required: false,
          order: 4
        },
        {
          id: 'conclusion',
          title: 'Final Recommendations',
          type: 'conclusion',
          content: 'Summary and personalized recommendations.',
          citationHooks: ['usage statistics', 'expert picks', 'trend analysis'],
          aiInstructions: 'Help readers choose based on their specific needs.',
          required: true,
          order: 5
        }
      ],
      citationOptimizations: [
        {
          technique: 'Quantified Rankings',
          description: 'Use specific metrics and scores for rankings',
          example: 'Tool X scored 9.2/10 in our performance testing...',
          effectiveness: 85,
          applicableTypes: ['statistic', 'list']
        },
        {
          technique: 'Multi-Source Validation',
          description: 'Confirm rankings with multiple data sources',
          example: 'This ranking is consistent across G2, Capterra, and expert reviews...',
          effectiveness: 88,
          applicableTypes: ['paragraph', 'statistic']
        }
      ],
      aiPrompts: [
        {
          section: 'list-items',
          prompt: 'Create a detailed list of the top {NUMBER} {CATEGORY} with explanations for each. Include key features, pros/cons, and ideal use cases. Rank them if applicable.',
          variables: ['NUMBER', 'CATEGORY'],
          expectedOutput: 'Ranked list with detailed descriptions'
        }
      ],
      estimatedCitationPotential: 80,
      difficulty: 'intermediate',
      wordCountRange: [2500, 4000],
      tags: ['curated', 'ranked', 'comprehensive', 'decision-helping'],
      examples: ['Best Project Management Tools', 'Top SEO Tools 2024', 'Best Programming Languages'],
      createdAt: new Date().toISOString()
    }
  ];
}

async function getUserSavedTemplates(userId: string): Promise<ContentTemplate[]> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_content_templates?user_id=eq.${userId}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    });

    const userTemplates = await response.json();
    return userTemplates.map((t: any) => ({
      ...t.template_data,
      id: `user-${t.id}`,
      createdAt: t.created_at
    })) || [];

  } catch (error) {
    console.error('Error fetching user templates:', error);
    return [];
  }
}

function getUniqueValues(templates: ContentTemplate[], field: keyof ContentTemplate): string[] {
  return [...new Set(templates.map(t => t[field] as string))];
}

async function getTemplate(body: any, user: any) {
  const validated = validateInput(body, {
    template_id: { type: 'string' as const, required: true },
    user_id: commonSchemas.userId
  });

  const { template_id, user_id } = validated;

  // Try built-in templates first
  const builtInTemplates = await getBuiltInTemplates();
  let template = builtInTemplates.find(t => t.id === template_id);

  // If not found, try user templates
  if (!template && template_id.startsWith('user-')) {
    const userTemplates = await getUserSavedTemplates(user_id);
    template = userTemplates.find(t => t.id === template_id);
  }

  if (!template) {
    throw new Error('Template not found');
  }

  return new Response(JSON.stringify({
    template,
    retrievedAt: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateCustomTemplate(body: any, user: any) {
  const validated = validateInput(body, {
    topic: { type: 'string' as const, required: true, maxLength: 200 },
    target_keywords: { type: 'string' as const, required: false }, // comma-separated
    content_goals: { type: 'string' as const, required: false }, // comma-separated
    audience_level: { type: 'string' as const, required: false },
    word_count: { type: 'number' as const, required: false },
    include_schema: { type: 'boolean' as const, required: false },
    citation_style: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  const {
    topic,
    target_keywords,
    content_goals,
    audience_level = 'intermediate',
    word_count = 2500,
    include_schema = true,
    citation_style = 'authoritative',
    user_id
  } = validated;

  const performCustomGeneration = withPerformanceMonitoring(async () => {
    const customTemplate = await generateTemplateWithAI({
      topic,
      targetKeywords: target_keywords?.split(',').map(k => k.trim()) || [],
      contentGoals: content_goals?.split(',').map(g => g.trim()) || [],
      audienceLevel: audience_level as 'beginner' | 'intermediate' | 'expert',
      wordCount: word_count,
      includeSchema: include_schema,
      citationStyle: citation_style as 'academic' | 'journalistic' | 'conversational' | 'authoritative'
    });

    return {
      customTemplate,
      generatedAt: new Date().toISOString(),
      canSave: true
    };
  }, 'custom-template-generation');

  const results = await performCustomGeneration();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateTemplateWithAI(customTemplate: CustomTemplate): Promise<ContentTemplate> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const prompt = `Create a citation-optimized content template for "${customTemplate.topic}".

Requirements:
- Target keywords: ${customTemplate.targetKeywords.join(', ')}
- Content goals: ${customTemplate.contentGoals.join(', ')}
- Audience level: ${customTemplate.audienceLevel}
- Target word count: ${customTemplate.wordCount}
- Citation style: ${customTemplate.citationStyle}

Generate a structured template with:
1. 5-8 main sections with clear titles and purposes
2. Citation optimization techniques for each section
3. Specific AI prompts for content generation
4. Estimated citation potential score (1-100)

Return JSON in this format:
{
  "name": "Custom Template Name",
  "category": "guide|how-to|comparison|list|FAQ|review|news|opinion",
  "contentType": "article|blog-post|product-page|landing-page|FAQ-page|resource-page",
  "structure": [
    {
      "title": "Section Title",
      "type": "heading|paragraph|list|quote|statistic|definition|example|conclusion",
      "content": "Purpose and description",
      "citationHooks": ["type1", "type2", "type3"],
      "aiInstructions": "Specific instructions for AI generation",
      "required": true|false,
      "order": 1
    }
  ],
  "citationOptimizations": [
    {
      "technique": "Technique Name",
      "description": "How to apply it",
      "example": "Concrete example",
      "effectiveness": 85,
      "applicableTypes": ["paragraph", "statistic"]
    }
  ],
  "estimatedCitationPotential": 85,
  "difficulty": "beginner|intermediate|advanced",
  "tags": ["tag1", "tag2", "tag3"]
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
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const templateData = JSON.parse(data.choices[0]?.message?.content || '{}');
    
    // Add required fields
    return {
      id: `custom-${Date.now()}`,
      name: templateData.name || `Custom Template: ${customTemplate.topic}`,
      category: templateData.category || 'guide',
      contentType: templateData.contentType || 'article',
      structure: templateData.structure?.map((section: any, index: number) => ({
        id: `section-${index + 1}`,
        ...section,
        order: index + 1
      })) || [],
      citationOptimizations: templateData.citationOptimizations || [],
      aiPrompts: generateAIPrompts(templateData.structure || []),
      schemaMarkup: customTemplate.includeSchema ? determineSchemaType(templateData.contentType) : undefined,
      estimatedCitationPotential: templateData.estimatedCitationPotential || 75,
      difficulty: templateData.difficulty || customTemplate.audienceLevel,
      wordCountRange: [Math.max(customTemplate.wordCount - 500, 500), customTemplate.wordCount + 500],
      tags: templateData.tags || ['custom', 'generated'],
      examples: [],
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('AI template generation failed:', error);
    // Return a fallback template
    return generateFallbackTemplate(customTemplate);
  }
}

function generateAIPrompts(structure: any[]): AIPrompt[] {
  return structure.map((section: any) => ({
    section: section.id || section.title.toLowerCase().replace(/\s+/g, '-'),
    prompt: section.aiInstructions || `Write content for the ${section.title} section focusing on {TOPIC}. Keep it engaging and informative.`,
    variables: ['TOPIC'],
    expectedOutput: section.type === 'list' ? 'Bulleted or numbered list' : 'Paragraph content'
  }));
}

function determineSchemaType(contentType: string): string {
  switch (contentType) {
    case 'FAQ-page': return 'FAQPage';
    case 'article': return 'Article';
    case 'blog-post': return 'BlogPosting';
    case 'product-page': return 'Product';
    default: return 'WebPage';
  }
}

function generateFallbackTemplate(customTemplate: CustomTemplate): ContentTemplate {
  return {
    id: `fallback-${Date.now()}`,
    name: `Custom Template: ${customTemplate.topic}`,
    category: 'guide',
    contentType: 'article',
    structure: [
      {
        id: 'intro',
        title: 'Introduction',
        type: 'paragraph',
        content: `Introduction to ${customTemplate.topic}`,
        citationHooks: ['statistics', 'expert quotes', 'studies'],
        aiInstructions: `Write an engaging introduction about ${customTemplate.topic}`,
        required: true,
        order: 1
      },
      {
        id: 'main-content',
        title: 'Main Content',
        type: 'paragraph',
        content: `Core information about ${customTemplate.topic}`,
        citationHooks: ['research', 'case studies', 'expert opinions'],
        aiInstructions: `Provide comprehensive information about ${customTemplate.topic}`,
        required: true,
        order: 2
      },
      {
        id: 'conclusion',
        title: 'Conclusion',
        type: 'conclusion',
        content: `Summary and key takeaways`,
        citationHooks: ['summary data', 'future trends'],
        aiInstructions: `Summarize key points about ${customTemplate.topic}`,
        required: true,
        order: 3
      }
    ],
    citationOptimizations: [
      {
        technique: 'Source Attribution',
        description: 'Always cite sources clearly',
        example: 'According to recent research...',
        effectiveness: 80,
        applicableTypes: ['paragraph']
      }
    ],
    aiPrompts: [],
    estimatedCitationPotential: 70,
    difficulty: customTemplate.audienceLevel,
    wordCountRange: [customTemplate.wordCount - 500, customTemplate.wordCount + 500],
    tags: ['custom', 'fallback'],
    examples: [],
    createdAt: new Date().toISOString()
  };
}

async function createContentFromTemplate(body: any, user: any) {
  const validated = validateInput(body, {
    template_id: { type: 'string' as const, required: true },
    topic: { type: 'string' as const, required: true, maxLength: 200 },
    target_keywords: { type: 'string' as const, required: false },
    additional_context: { type: 'string' as const, required: false },
    user_id: commonSchemas.userId
  });

  const { template_id, topic, target_keywords, additional_context, user_id } = validated;

  const performContentCreation = withPerformanceMonitoring(async () => {
    // Get the template
    const builtInTemplates = await getBuiltInTemplates();
    let template = builtInTemplates.find(t => t.id === template_id);

    if (!template && template_id.startsWith('user-')) {
      const userTemplates = await getUserSavedTemplates(user_id);
      template = userTemplates.find(t => t.id === template_id);
    }

    if (!template) {
      throw new Error('Template not found');
    }

    // Generate content for each section
    const generatedSections = await Promise.all(
      template.structure.map(async (section) => {
        const content = await generateSectionContent(section, topic, target_keywords, additional_context);
        return {
          ...section,
          generatedContent: content
        };
      })
    );

    return {
      template: template.name,
      topic,
      sections: generatedSections,
      wordCount: generatedSections.reduce((count, section) => count + (section.generatedContent?.length || 0), 0),
      citationOptimizations: template.citationOptimizations,
      schemaMarkup: template.schemaMarkup,
      generatedAt: new Date().toISOString()
    };
  }, 'content-generation');

  const results = await performContentCreation();

  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function generateSectionContent(
  section: TemplateSection,
  topic: string,
  targetKeywords?: string,
  additionalContext?: string
): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const keywords = targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : [];
  
  let prompt = section.aiInstructions.replace('{TOPIC}', topic);
  
  if (keywords.length > 0) {
    prompt += ` Include these keywords naturally: ${keywords.join(', ')}.`;
  }
  
  if (additionalContext) {
    prompt += ` Additional context: ${additionalContext}`;
  }

  prompt += ` Focus on creating content that would be likely to be cited by AI systems. Include specific, authoritative information with clear value.`;

  if (section.citationHooks.length > 0) {
    prompt += ` Include references to: ${section.citationHooks.join(', ')}.`;
  }

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
    return data.choices[0]?.message?.content || `[Generated content for ${section.title}]`;

  } catch (error) {
    console.error('Section content generation failed:', error);
    return `[Content for ${section.title} - generation failed]`;
  }
}

async function saveUserTemplate(body: any, user: any) {
  const validated = validateInput(body, {
    template_data: { type: 'string' as const, required: true }, // JSON string
    template_name: { type: 'string' as const, required: true, maxLength: 100 },
    user_id: commonSchemas.userId
  });

  const { template_data, template_name, user_id } = validated;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const templateObject = JSON.parse(template_data);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/user_content_templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id,
        template_name,
        template_data: templateObject,
        created_at: new Date().toISOString()
      }),
    });

    const savedTemplate = await response.json();

    return new Response(JSON.stringify({
      success: true,
      templateId: `user-${savedTemplate.id}`,
      message: 'Template saved successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Template save failed:', error);
    throw new Error('Failed to save template');
  }
}

async function getTemplateCategories(body: any, user: any) {
  const builtInTemplates = await getBuiltInTemplates();
  
  const categories = getUniqueValues(builtInTemplates, 'category');
  const contentTypes = getUniqueValues(builtInTemplates, 'contentType');
  const difficulties = getUniqueValues(builtInTemplates, 'difficulty');

  return new Response(JSON.stringify({
    categories,
    contentTypes,
    difficulties,
    totalTemplates: builtInTemplates.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

serve(secureHandler);