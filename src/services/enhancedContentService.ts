import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced content types with AI optimization
export type ContentType = 'blog' | 'article' | 'faq' | 'product-description' | 'landing-page' | 'social-post' | 'email' | 'press-release';
export type ToneStyle = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'conversational' | 'technical' | 'persuasive' | 'educational';
export type ContentLength = 'short' | 'medium' | 'long' | 'comprehensive';

export interface EnhancedContentRequest {
  topic: string;
  keywords: string[];
  contentType: ContentType;
  toneStyle: ToneStyle;
  length: ContentLength;
  targetAudience?: string;
  competitors?: string[];
  includeSchema?: boolean;
  optimizeForAI?: boolean;
  includeCtaVariants?: boolean;
  language?: string;
  brandVoice?: string;
  seoFocus?: 'high' | 'medium' | 'low';
}

export interface AIOptimizationFeatures {
  questionAnswering: boolean;
  structuredData: boolean;
  featuredSnippets: boolean;
  voiceSearchOptimized: boolean;
  readabilityOptimized: boolean;
}

export interface EnhancedContentBlock {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    seoScore: number;
    aiOptimizationScore: number;
    keywordDensity: Record<string, number>;
    headingStructure: Array<{level: number, text: string}>;
    seoTitle: string;
    metaDescription: string;
    schema?: any;
    faqs?: Array<{question: string, answer: string}>;
    ctaVariants?: string[];
    socialMediaPreviews?: {
      twitter: { title: string, description: string };
      facebook: { title: string, description: string };
      linkedin: { title: string, description: string };
    };
  };
  optimization: {
    suggestions: string[];
    aiReadiness: number;
    competitorAnalysis?: string[];
    improvementAreas: string[];
  };
  created_at: string;
  updated_at: string;
}

// Advanced AI prompting system
class AIPromptEngine {
  private getSystemPrompt(request: EnhancedContentRequest): string {
    const basePrompt = `You are an advanced AI content generator specialized in creating high-quality, SEO-optimized content that ranks well in both traditional search engines and AI-powered search systems like ChatGPT, Claude, and Perplexity.

Content Requirements:
- Topic: ${request.topic}
- Type: ${request.contentType}
- Tone: ${request.toneStyle}
- Length: ${request.length}
- Keywords: ${request.keywords.join(', ')}
${request.targetAudience ? `- Target Audience: ${request.targetAudience}` : ''}

CRITICAL AI OPTIMIZATION RULES:
1. Use clear, structured formatting with proper headings (H1, H2, H3)
2. Include question-answer sections that AI systems can easily extract
3. Use bullet points and numbered lists for easy scanning
4. Include relevant statistics and data points
5. Create content that directly answers user queries
6. Use semantic keywords and related terms naturally
7. Include FAQ sections when relevant
8. Optimize for featured snippets with concise, direct answers
9. Use schema markup suggestions
10. Create content that's both human-readable and AI-parseable

SEO OPTIMIZATION:
- Primary keyword placement in title, first paragraph, and throughout content
- Use related keywords and LSI terms
- Include internal linking opportunities
- Meta description and title tag suggestions
- Proper heading hierarchy`;

    if (request.optimizeForAI) {
      return basePrompt + `

ENHANCED AI OPTIMIZATION:
- Structure content to answer "what", "why", "how", "when", "where" questions
- Include step-by-step instructions when applicable
- Use data-driven insights and specific examples
- Create quotable, shareable snippets
- Include comparison sections and pros/cons lists
- Use transitional phrases that AI systems recognize
- Include relevant citations and sources`;
    }

    return basePrompt;
  }

  private getContentTypePrompt(type: ContentType): string {
    const prompts = {
      'blog': 'Create an engaging blog post with introduction, main content sections, and conclusion. Include subheadings and actionable insights.',
      'article': 'Write a comprehensive, authoritative article with deep analysis and expert insights. Include data, examples, and thorough coverage of the topic.',
      'faq': 'Generate a comprehensive FAQ section with 8-12 relevant questions and detailed answers. Each answer should be informative and actionable.',
      'product-description': 'Create compelling product descriptions that highlight benefits, features, and unique selling points. Include technical specifications when relevant.',
      'landing-page': 'Write persuasive landing page copy with headlines, benefits, social proof sections, and multiple CTA variations.',
      'social-post': 'Create engaging social media content with hashtags, calls-to-action, and platform-specific formatting.',
      'email': 'Write effective email content with subject line, personalized greeting, valuable content, and clear call-to-action.',
      'press-release': 'Create a professional press release following AP style guidelines with headline, dateline, body, and company boilerplate.'
    };
    return prompts[type];
  }

  public generatePrompt(request: EnhancedContentRequest): string {
    const systemPrompt = this.getSystemPrompt(request);
    const contentTypePrompt = this.getContentTypePrompt(request.contentType);
    
    return `${systemPrompt}

CONTENT TYPE SPECIFIC INSTRUCTIONS:
${contentTypePrompt}

OUTPUT FORMAT:
Please provide the content in the following JSON structure:
{
  "title": "Main title optimized for SEO and AI",
  "content": "Full markdown content with proper formatting",
  "htmlContent": "HTML version with proper tags",
  "seoTitle": "SEO-optimized title tag (50-60 chars)",
  "metaDescription": "Compelling meta description (150-160 chars)",
  "faqs": [{"question": "Question text", "answer": "Answer text"}],
  "ctaVariants": ["CTA option 1", "CTA option 2", "CTA option 3"],
  "headingStructure": [{"level": 1, "text": "Heading text"}],
  "keywordDensity": {"keyword": percentage},
  "schema": "Suggested JSON-LD schema markup",
  "aiOptimizationTips": ["tip1", "tip2", "tip3"]
}

Generate high-quality, original content that provides real value to readers while being optimized for both search engines and AI systems.`;
  }
}

// Enhanced content generation service
export class EnhancedContentService {
  private promptEngine = new AIPromptEngine();

  async generateContent(request: EnhancedContentRequest): Promise<EnhancedContentBlock> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }

      // Generate advanced prompt
      const prompt = this.promptEngine.generatePrompt(request);
      
      // Call enhanced content generation function
      const { data, error } = await supabase.functions.invoke('generate-enhanced-content', {
        body: JSON.stringify({
          prompt,
          request,
          user_id: user.id
        })
      });

      if (error) {
        console.error('Content generation error:', error);
        throw new Error('Failed to generate content');
      }

      // Process and enhance the response
      const contentBlock = this.processGeneratedContent(data, request);
      
      // Save to database
      await this.saveContentBlock(contentBlock, user.id);
      
      return contentBlock;
      
    } catch (error) {
      console.error('Enhanced content generation error:', error);
      throw error;
    }
  }

  private processGeneratedContent(data: any, request: EnhancedContentRequest): EnhancedContentBlock {
    const now = new Date().toISOString();
    
    return {
      id: `content_${Date.now()}`,
      title: data.title || `Generated ${request.contentType}`,
      content: data.content || '',
      htmlContent: data.htmlContent || data.content || '',
      metadata: {
        wordCount: this.countWords(data.content || ''),
        readingTime: this.calculateReadingTime(data.content || ''),
        seoScore: this.calculateSEOScore(data, request),
        aiOptimizationScore: this.calculateAIOptimizationScore(data),
        keywordDensity: data.keywordDensity || {},
        headingStructure: data.headingStructure || [],
        seoTitle: data.seoTitle || data.title || '',
        metaDescription: data.metaDescription || '',
        schema: data.schema,
        faqs: data.faqs || [],
        ctaVariants: data.ctaVariants || [],
        socialMediaPreviews: this.generateSocialPreviews(data)
      },
      optimization: {
        suggestions: data.aiOptimizationTips || [],
        aiReadiness: this.calculateAIOptimizationScore(data),
        improvementAreas: this.identifyImprovementAreas(data, request)
      },
      created_at: now,
      updated_at: now
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 250;
    const words = this.countWords(text);
    return Math.ceil(words / wordsPerMinute);
  }

  private calculateSEOScore(data: any, request: EnhancedContentRequest): number {
    let score = 0;
    
    // Check title optimization
    if (data.seoTitle && data.seoTitle.length >= 50 && data.seoTitle.length <= 60) score += 20;
    
    // Check meta description
    if (data.metaDescription && data.metaDescription.length >= 150 && data.metaDescription.length <= 160) score += 20;
    
    // Check keyword usage
    if (data.keywordDensity && Object.keys(data.keywordDensity).length > 0) score += 25;
    
    // Check heading structure
    if (data.headingStructure && data.headingStructure.length >= 3) score += 20;
    
    // Check content length
    const wordCount = this.countWords(data.content || '');
    if (wordCount >= 500) score += 15;
    
    return Math.min(100, score);
  }

  private calculateAIOptimizationScore(data: any): number {
    let score = 0;
    
    // Check for FAQ section
    if (data.faqs && data.faqs.length > 0) score += 25;
    
    // Check for structured content
    if (data.headingStructure && data.headingStructure.length >= 4) score += 25;
    
    // Check for bullet points/lists (rough estimation)
    const content = data.content || '';
    if (content.includes('- ') || content.includes('* ') || content.includes('1. ')) score += 20;
    
    // Check for question-answer format
    if (content.includes('?') && content.includes('Answer:')) score += 15;
    
    // Check for schema markup
    if (data.schema) score += 15;
    
    return Math.min(100, score);
  }

  private identifyImprovementAreas(data: any, request: EnhancedContentRequest): string[] {
    const areas: string[] = [];
    
    if (!data.faqs || data.faqs.length < 3) {
      areas.push('Add more FAQ sections for better AI searchability');
    }
    
    if (!data.schema) {
      areas.push('Include structured data markup for enhanced search visibility');
    }
    
    const wordCount = this.countWords(data.content || '');
    if (wordCount < 500) {
      areas.push('Increase content length for better search ranking');
    }
    
    if (!data.ctaVariants || data.ctaVariants.length < 2) {
      areas.push('Include multiple call-to-action variations');
    }
    
    return areas;
  }

  private generateSocialPreviews(data: any) {
    const title = data.title || 'Generated Content';
    const description = data.metaDescription || 'High-quality AI-generated content';
    
    return {
      twitter: {
        title: title.substring(0, 70),
        description: description.substring(0, 200)
      },
      facebook: {
        title: title.substring(0, 100),
        description: description.substring(0, 300)
      },
      linkedin: {
        title: title.substring(0, 150),
        description: description.substring(0, 256)
      }
    };
  }

  private async saveContentBlock(contentBlock: EnhancedContentBlock, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .insert({
          user_id: userId,
          title: contentBlock.title,
          content: contentBlock.content,
          html_content: contentBlock.htmlContent,
          metadata: contentBlock.metadata,
          optimization: contentBlock.optimization,
          created_at: contentBlock.created_at,
          updated_at: contentBlock.updated_at
        });

      if (error) {
        console.error('Error saving content block:', error);
      }
    } catch (error) {
      console.error('Error in saveContentBlock:', error);
    }
  }

  // Content optimization methods
  async optimizeForAI(content: string, keywords: string[]): Promise<{
    optimizedContent: string;
    suggestions: string[];
    aiReadinessScore: number;
  }> {
    const { data, error } = await supabase.functions.invoke('optimize-content-for-ai', {
      body: JSON.stringify({ content, keywords })
    });

    if (error) {
      throw new Error('Failed to optimize content for AI');
    }

    return data;
  }

  async generateCompetitorAnalysis(topic: string, competitors: string[]): Promise<{
    gaps: string[];
    opportunities: string[];
    recommendations: string[];
  }> {
    const { data, error } = await supabase.functions.invoke('analyze-competitors', {
      body: JSON.stringify({ topic, competitors })
    });

    if (error) {
      throw new Error('Failed to analyze competitors');
    }

    return data;
  }
}

export const enhancedContentService = new EnhancedContentService();
