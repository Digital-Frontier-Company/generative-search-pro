
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

// Ultimate SEO-AEO system prompt with viral hooks and optimization framework
const getAdvancedSystemPrompt = (topic: string, contentType: string | undefined, toneStyle: string | undefined, targetAudience: string | undefined, keywords: string[] | undefined) => {
  const basePrompt = `You are the "Meta Mercenary" - an elite SEO-AEO content creation system built for digital marketing dominance. Your mission: Generate content that triggers clicks, builds authority, and converts with machine precision.

CORE IDENTITY:
- Style: No-fluff. Bold. Dopamine-driven. Sharp. Strategic. Like a sales sniper writing.
- Purpose: Create content that dominates search engines AND answer engines through strategic optimization.
- Focus: "${topic}" with ${toneStyle || 'professional'} tone for ${targetAudience || 'business professionals'} audience.
- Keywords: ${keywords?.join(', ') || topic}

ULTIMATE SEO-AEO FRAMEWORK:

1. VIRAL HOOK INTEGRATION:
Use these proven viral hook patterns:
- Pattern Interrupt: Start with contrarian/shocking statements
- Psychological Triggers: FOMO, urgency, curiosity gaps
- Power Words: "Revealed," "Exclusive," "Instant," "Proven," "Guaranteed"
- Question-based hooks: "Did you know..." "What you don't know about..."
- Challenge beliefs: "Stop doing [common behavior]..."
- Quick wins: "Steal my 3-step blueprint..."

2. NEUROLINGUISTIC PROGRAMMING:
- Use sensory language and emotional triggers
- Create mental movies with vivid descriptions
- Anchor positive feelings to your solutions
- Use presuppositions and embedded commands
- Mirror audience language patterns

3. ANSWER ENGINE OPTIMIZATION (AEO):
- Lead with HERO ANSWER (≤50 words) that directly answers the query
- Use answer-first pattern: "What is X? X is... Why it matters: ..."
- Include definitional sentences in hero sections
- Add concise "What/Who/How/Cost" boxes
- Structure for zero-click optimization

4. CONTENT ARCHITECTURE:
- One focused objective per page (Clear, Measurable, High impact)
- Question-oriented title tags
- Logical heading hierarchy (H1 → H2 → H3)
- FAQ sections with explicit Q→A pairs
- Cited statistics and verifiable sources

5. EVERGREEN + FRESH STRATEGY:
- Focus on timeless value while addressing current trends
- Include how-tos, guides, and comprehensive answers
- Build pillar content that supports topic clusters
- Create content that attracts natural backlinks

CONTENT REQUIREMENTS:

STRUCTURE:
- Hero Answer (≤50 words) - Direct answer to main query
- Viral Hook opening using proven templates
- Value-packed body with NLP techniques
- FAQ section with schema-ready Q&A pairs
- Strong CTA variants (3 different approaches)

SEO OPTIMIZATION:
- Primary keyword in first paragraph and title
- Natural keyword distribution (no stuffing)
- Long-tail keyword integration
- Related entity mentions
- Image alt tag recommendations

METADATA GENERATION:
- Click-triggering page titles (≤60 chars)
- Compelling meta descriptions (≤160 chars)
- Open Graph optimization
- Twitter card optimization
- JSON-LD schema (FAQPage, Article, or relevant type)

TONE CALIBRATION: ${toneStyle || 'professional'}
TARGET AUDIENCE: ${targetAudience || 'business professionals'}
CONTENT TYPE: ${contentType || 'blog'} post`;

  // Content type specific instructions
  const typeInstructions = {
    'blog': 'Format as an engaging, shareable blog post with viral hooks, clear value propositions, and conversion-focused CTAs.',
    'article': 'Create authoritative, in-depth article with expert positioning, citations, and comprehensive coverage.',
    'faq': 'Structure as comprehensive FAQ with perfect schema markup, anticipating all user questions and objections.',
  };

  if (contentType && typeInstructions[contentType as keyof typeof typeInstructions]) {
    return basePrompt + `\n\nSPECIFIC FORMAT: ${typeInstructions[contentType as keyof typeof typeInstructions]}`;
  }
  
  return basePrompt;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, keywords, toneStyle, targetAudience, contentType } = await req.json();
    console.log("Advanced SEO-AEO request received:", { topic, keywords, contentType, toneStyle, targetAudience });

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

    console.log('OpenAI API key found, generating SEO-AEO optimized content');

    // Get advanced system prompt with SEO-AEO framework
    const systemPrompt = getAdvancedSystemPrompt(topic, contentType, toneStyle, targetAudience, keywords);
    const userPrompt = `Create ultimate SEO-AEO optimized content about "${topic}" using the viral hook framework and optimization strategies. Target keywords: ${keywords?.join(', ') || topic}. 

DELIVERABLES REQUIRED:
1. Hero Answer (≤50 words)
2. Viral hook opening
3. Complete optimized content with NLP techniques
4. FAQ section with Q&A pairs
5. Full metadata package
6. JSON-LD schema
7. Three CTA variants
8. Optimization recommendations`;

    console.log('Calling OpenAI API with advanced SEO-AEO framework...');

    // Call OpenAI API to generate content
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        functions: [
          {
            name: 'format_seo_aeo_content',
            description: 'Format SEO-AEO optimized content with viral hooks and complete metadata',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Click-triggering, keyword-optimized title' },
                heroAnswer: { type: 'string', description: 'Direct answer to main query (≤50 words)' },
                content: { type: 'string', description: 'Complete HTML content with viral hooks, NLP techniques, and optimization' },
                metadata: {
                  type: 'object',
                  properties: {
                    seoTitle: { type: 'string', description: 'Click-triggering SEO title (≤60 chars)' },
                    metaDescription: { type: 'string', description: 'Compelling meta description (≤160 chars)' },
                    ogTitle: { type: 'string', description: 'Open Graph optimized title' },
                    ogDescription: { type: 'string', description: 'Open Graph description' },
                    twitterTitle: { type: 'string', description: 'Twitter card title' },
                    twitterDescription: { type: 'string', description: 'Twitter card description' },
                    jsonLdSchema: { type: 'object', description: 'Complete JSON-LD schema with AEO optimization' },
                    ctaVariants: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Three conversion-focused CTA variants'
                    },
                    focusKeywords: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Primary and secondary keywords used'
                    },
                    viralHookUsed: { type: 'string', description: 'Which viral hook template was applied' },
                    aeoSignals: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'AEO optimization elements included'
                    }
                  },
                  required: ['seoTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription', 'jsonLdSchema', 'ctaVariants', 'focusKeywords', 'viralHookUsed', 'aeoSignals']
                }
              },
              required: ['title', 'heroAnswer', 'content', 'metadata']
            }
          }
        ],
        function_call: { name: 'format_seo_aeo_content' }
      }),
    });

    const data = await openaiResponse.json();
    console.log("OpenAI response received for SEO-AEO content");
    
    // Check for errors in the OpenAI response
    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${data.error.message}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse the function call result
    try {
      const functionCall = data.choices[0]?.message?.function_call;
      if (!functionCall) {
        throw new Error("No function call in response");
      }

      const functionArgs = JSON.parse(functionCall.arguments);
      
      // Validate the schema with AEO requirements
      const schemaValidation = validateSchema(functionArgs.metadata?.jsonLdSchema);
      
      // Add validation results
      functionArgs.schemaValidation = schemaValidation;
      
      // Add AEO-specific recommendations
      if (!schemaValidation.isValid && functionArgs.metadata?.jsonLdSchema) {
        console.log("Schema validation issues:", schemaValidation.issues);
        functionArgs.metadata.schemaWarnings = schemaValidation.issues;
        functionArgs.metadata.aeoRecommendations = [
          "Implement structured data for better machine readability",
          "Add FAQ schema for answer engine optimization",
          "Include author and publisher information for E-E-A-T signals"
        ];
      }
      
      // Generate embedding for semantic search
      const contentForEmbedding = `${functionArgs.title} ${functionArgs.heroAnswer} ${functionArgs.content.replace(/<[^>]*>/g, ' ')}`;
      
      console.log('Generating content embedding for vector search...');
      
      // Call OpenAI API to generate embedding
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
        console.log("Proceeding without embedding");
      } else {
        functionArgs.embedding = embeddingData.data[0].embedding;
        console.log("Content embedding generated successfully");
      }

      // Store the content in the database
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseServiceKey) {
        console.log('Storing SEO-AEO optimized content in database...');
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Get user ID from the request headers
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
            title: functionArgs.title,
            content: functionArgs.content,
            hero_answer: functionArgs.heroAnswer,
            metadata: functionArgs.metadata,
            content_embedding: functionArgs.embedding,
            user_id: userId,
            generated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('Error storing content:', insertError);
        } else {
          console.log('SEO-AEO content stored successfully with ID:', insertData.id);
          functionArgs.id = insertData.id;
        }
      }
      
      // Return the SEO-AEO optimized content
      return new Response(JSON.stringify(functionArgs), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return new Response(JSON.stringify({ 
        error: 'Failed to parse content generation result',
        details: parseError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error("Error in advanced SEO-AEO generation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
