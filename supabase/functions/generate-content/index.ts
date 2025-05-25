
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced schema validation function with AEO requirements
function validateSchema(schema: any): { isValid: boolean; issues: string[] | null } {
  if (!schema || typeof schema !== 'object') {
    return { isValid: false, issues: ["Schema must be an object"] };
  }
  
  const issues: string[] = [];
  
  // Basic schema validation
  if (!schema['@context']) issues.push("Missing @context property for machine readability");
  if (!schema['@type']) issues.push("Missing @type property for content classification");
  
  // AEO-specific validation
  if (schema['@type'] === 'FAQPage') {
    if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
      issues.push("FAQPage schema must include mainEntity array for Answer Engine Optimization");
    } else {
      schema.mainEntity.forEach((qa: any, index: number) => {
        if (!qa.name) issues.push(`FAQ ${index + 1} missing question name`);
        if (!qa.acceptedAnswer?.text) issues.push(`FAQ ${index + 1} missing answer text`);
      });
    }
  }
  
  if (['Article', 'BlogPosting', 'NewsArticle'].includes(schema['@type'])) {
    if (!schema.headline) issues.push("Article schema should include headline for snippet optimization");
    if (!schema.author) issues.push("Missing author for E-E-A-T authority signals");
    if (!schema.publisher) issues.push("Missing publisher for credibility markers");
    if (!schema.datePublished) issues.push("Missing publication date for freshness signals");
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues.length > 0 ? issues : null
  };
}

// Enhanced system prompt for comprehensive content generation
const getComprehensiveContentPrompt = (topic: string, contentType: string | undefined, toneStyle: string | undefined, targetAudience: string | undefined, keywords: string[] | undefined) => {
  return `You are an expert content strategist and SEO specialist creating comprehensive, in-depth content for GenerativeSearch.pro.

CRITICAL REQUIREMENTS:
- MINIMUM 750 WORDS for all blog content
- Comprehensive, detailed coverage of the topic
- Include real-world examples and case studies
- Add actionable insights and practical tips
- Structure for maximum readability and engagement

CONTENT FOCUS: "${topic}"
TONE: ${toneStyle || 'professional'}
AUDIENCE: ${targetAudience || 'business professionals'}
KEYWORDS: ${keywords?.join(', ') || topic}
TYPE: ${contentType || 'blog'} post

CONTENT STRUCTURE REQUIREMENTS:
1. Compelling headline that includes primary keyword
2. Hero answer (50 words max) - direct answer to main query
3. Comprehensive introduction (150+ words)
4. 4-6 detailed sections with H2 headings (100+ words each)
5. Real examples, statistics, and actionable advice
6. FAQ section with 5+ relevant questions
7. Strong conclusion with clear next steps

SEO & AEO OPTIMIZATION:
- Primary keyword in title, first paragraph, and naturally throughout
- Related keywords and entities integrated seamlessly
- Structured for featured snippets and answer boxes
- Include relevant statistics and data points
- Add authoritative sources and references

ENGAGEMENT ELEMENTS:
- Subheadings that create curiosity
- Bullet points and numbered lists for scannability
- Bold text for key concepts
- Internal logic flow between sections
- Clear value proposition in each section

Create comprehensive, authoritative content that establishes expertise and provides genuine value to readers seeking information about ${topic}.`;
};

// Humanization prompt for natural, engaging content
const getHumanizationPrompt = () => {
  return `You are a professional content editor specializing in humanizing AI-generated content for GenerativeSearch.pro. Your task is to transform the provided content into natural, engaging, human-like writing while maintaining all SEO elements and technical accuracy.

HUMANIZATION REQUIREMENTS:
1. Add conversational elements and natural transitions
2. Include personal insights and relatable examples
3. Vary sentence length and structure for better flow
4. Add emotional context and storytelling elements
5. Ensure the content sounds like it was written by an experienced professional
6. Maintain all technical accuracy and SEO optimization
7. Keep the word count at minimum 750 words
8. Preserve all structured data and metadata

WRITING STYLE:
- Use active voice where appropriate
- Include rhetorical questions to engage readers
- Add transitional phrases for smooth flow
- Incorporate industry insights and professional experience
- Balance informative content with engaging narrative
- Ensure expertise, authoritativeness, and trustworthiness (E-E-A-T)

OUTPUT FORMAT:
Return properly formatted HTML with:
- H1, H2, H3 tags for hierarchy
- Proper paragraph structure
- Bold and italic emphasis where appropriate
- Bullet points and numbered lists
- FAQ section with structured Q&A format

Transform the content to sound natural and human while maintaining its comprehensive, authoritative nature.`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, keywords, toneStyle, targetAudience, contentType } = await req.json();
    console.log("Comprehensive content request received:", { topic, keywords, contentType, toneStyle, targetAudience });

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required for content generation' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get OpenAI API key from Supabase secrets
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        details: 'Please ensure OPENAI_API_KEY is set in Supabase secrets'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating comprehensive 750+ word content...');

    // STEP 1: Generate comprehensive content
    const comprehensivePrompt = getComprehensiveContentPrompt(topic, contentType, toneStyle, targetAudience, keywords);
    
    const initialResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: comprehensivePrompt },
          { role: 'user', content: `Create comprehensive, in-depth content about "${topic}" that is minimum 750 words. Include detailed sections, examples, and actionable insights. Target keywords: ${keywords?.join(', ') || topic}` }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        functions: [
          {
            name: 'format_comprehensive_content',
            description: 'Format comprehensive SEO-optimized content with full metadata',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'SEO-optimized title with primary keyword' },
                heroAnswer: { type: 'string', description: 'Direct answer to main query (≤50 words)' },
                content: { type: 'string', description: 'Comprehensive HTML content (minimum 750 words)' },
                metadata: {
                  type: 'object',
                  properties: {
                    seoTitle: { type: 'string', description: 'SEO title (≤60 chars)' },
                    metaDescription: { type: 'string', description: 'Meta description (≤160 chars)' },
                    ogTitle: { type: 'string', description: 'Open Graph title' },
                    ogDescription: { type: 'string', description: 'Open Graph description' },
                    twitterTitle: { type: 'string', description: 'Twitter card title' },
                    twitterDescription: { type: 'string', description: 'Twitter card description' },
                    jsonLdSchema: { type: 'object', description: 'JSON-LD schema markup' },
                    ctaVariants: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Three CTA variants'
                    },
                    focusKeywords: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Primary and secondary keywords'
                    }
                  },
                  required: ['seoTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription', 'jsonLdSchema', 'ctaVariants', 'focusKeywords']
                }
              },
              required: ['title', 'heroAnswer', 'content', 'metadata']
            }
          }
        ],
        function_call: { name: 'format_comprehensive_content' }
      }),
    });

    const initialData = await initialResponse.json();
    console.log("Initial comprehensive content generated");
    
    if (initialData.error) {
      console.error("OpenAI API Error:", initialData.error);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${initialData.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const initialContent = JSON.parse(initialData.choices[0]?.message?.function_call?.arguments);
    
    console.log('Running humanization process...');

    // STEP 2: Humanize the content
    const humanizationPrompt = getHumanizationPrompt();
    
    const humanizedResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: humanizationPrompt },
          { role: 'user', content: `Humanize this content while maintaining all SEO elements and ensuring it remains minimum 750 words:\n\nTITLE: ${initialContent.title}\n\nHERO ANSWER: ${initialContent.heroAnswer}\n\nCONTENT: ${initialContent.content}` }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    const humanizedData = await humanizedResponse.json();
    console.log("Content humanization completed");
    
    if (humanizedData.error) {
      console.error("Humanization Error:", humanizedData.error);
      // Fall back to original content if humanization fails
      console.log("Falling back to original content");
    } else {
      // Update content with humanized version
      initialContent.content = humanizedData.choices[0]?.message?.content || initialContent.content;
    }

    // Validate the schema
    const schemaValidation = validateSchema(initialContent.metadata?.jsonLdSchema);
    initialContent.schemaValidation = schemaValidation;
    
    if (!schemaValidation.isValid && initialContent.metadata?.jsonLdSchema) {
      console.log("Schema validation issues:", schemaValidation.issues);
      initialContent.metadata.schemaWarnings = schemaValidation.issues;
    }
    
    // Generate embedding for semantic search
    const contentForEmbedding = `${initialContent.title} ${initialContent.heroAnswer} ${initialContent.content.replace(/<[^>]*>/g, ' ')}`;
    
    console.log('Generating content embedding for vector search...');
    
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: contentForEmbedding
      }),
    });
    
    const embeddingData = await embeddingResponse.json();
    
    if (embeddingData.error) {
      console.error("Error generating embedding:", embeddingData.error);
    } else {
      initialContent.embedding = embeddingData.data[0].embedding;
      console.log("Content embedding generated successfully");
    }

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (supabaseUrl && supabaseServiceKey) {
      console.log('Storing humanized 750+ word content in database...');
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const authHeader = req.headers.get('authorization');
      let userId = null;
      
      if (authHeader) {
        try {
          const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
          userId = user?.id;
        } catch (e) {
          console.log('Could not get user from auth header');
        }
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('content_blocks')
        .insert({
          title: initialContent.title,
          content: initialContent.content,
          hero_answer: initialContent.heroAnswer,
          metadata: initialContent.metadata,
          content_embedding: initialContent.embedding,
          user_id: userId,
          generated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error storing content:', insertError);
      } else {
        console.log('Comprehensive humanized content stored successfully with ID:', insertData.id);
        initialContent.id = insertData.id;
      }
    }
    
    return new Response(JSON.stringify(initialContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in comprehensive content generation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
