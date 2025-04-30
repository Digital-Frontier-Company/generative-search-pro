
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple schema validation function for the edge function
// This is a simplified version of the client-side validator
function validateSchema(schema: any): { isValid: boolean; issues: string[] | null } {
  if (!schema || typeof schema !== 'object') {
    return { isValid: false, issues: ["Schema must be an object"] };
  }
  
  const issues: string[] = [];
  
  // Basic schema validation
  if (!schema['@context']) issues.push("Missing @context property");
  if (!schema['@type']) issues.push("Missing @type property");
  
  // Type-specific validation
  if (schema['@type'] === 'FAQPage' && (!schema.mainEntity || !Array.isArray(schema.mainEntity))) {
    issues.push("FAQPage schema must include mainEntity array");
  }
  
  if (['Article', 'BlogPosting', 'NewsArticle'].includes(schema['@type'])) {
    if (!schema.headline) issues.push("Article schema should include headline");
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues.length > 0 ? issues : null
  };
}

// Define system prompts based on content type
const getSystemPrompt = (topic: string, contentType: string | undefined, toneStyle: string | undefined, targetAudience: string | undefined, keywords: string[] | undefined) => {
  let systemPrompt = `You are an expert SEO content creator specializing in Answer Engine Optimization (AEO). 
Create high-quality, factual content about the topic "${topic}" with a "${toneStyle || 'professional'}" tone`;
  
  if (targetAudience) {
    systemPrompt += ` for a "${targetAudience}" audience`;
  }
  
  systemPrompt += `. Focus on the keywords: ${keywords?.join(', ') || topic}.
Follow these guidelines:
1. Create detailed, factual content with a clear answer-first approach
2. Include a hero answer (≤ 50 words) at the beginning that directly answers the main question
3. Use proper HTML formatting with semantic headings (h1, h2, h3, etc.), paragraphs, and lists
4. Include relevant FAQs that target users might ask
5. Generate complete SEO metadata including title tags, meta descriptions, Open Graph data
6. Provide 3 unique CTA variants that could be used with this content
7. Include a properly formatted JSON-LD schema that follows Schema.org standards`;

  // Content type specific instructions
  const contentTypeInstructions = {
    'blog': 'Format as an engaging blog post with introduction, body sections, and conclusion.',
    'article': 'Format as an informative article with detailed sections and subsections.',
    'faq': 'Format with an emphasis on questions and answers, with comprehensive FAQ section and a FAQPage JSON-LD schema.',
  };

  if (contentType && contentTypeInstructions[contentType as keyof typeof contentTypeInstructions]) {
    systemPrompt += `\n\n${contentTypeInstructions[contentType as keyof typeof contentTypeInstructions]}`;
  }
  
  return systemPrompt;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, keywords, toneStyle, targetAudience, contentType } = await req.json();
    console.log("Request received:", { topic, keywords, contentType, toneStyle });

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(topic, contentType, toneStyle, targetAudience, keywords);
    const userPrompt = `Create complete content about "${topic}" focusing on keywords: ${keywords?.join(', ') || topic}.`;

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
        max_tokens: 3000,
        functions: [
          {
            name: 'format_content',
            description: 'Format the generated content with appropriate metadata',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'The title of the content' },
                heroAnswer: { type: 'string', description: 'Direct answer to the topic, 50 words or less' },
                content: { type: 'string', description: 'The HTML content body' },
                metadata: {
                  type: 'object',
                  properties: {
                    seoTitle: { type: 'string', description: 'SEO-optimized title tag (up to 60 chars)' },
                    metaDescription: { type: 'string', description: 'Meta description (up to 160 chars)' },
                    ogTitle: { type: 'string', description: 'Open Graph title' },
                    ogDescription: { type: 'string', description: 'Open Graph description' },
                    twitterTitle: { type: 'string', description: 'Twitter card title' },
                    twitterDescription: { type: 'string', description: 'Twitter card description' },
                    jsonLdSchema: { type: 'object', description: 'JSON-LD schema data' },
                    ctaVariants: { 
                      type: 'array', 
                      items: { type: 'string' },
                      description: 'Three different call-to-action text variants'
                    }
                  },
                  required: ['seoTitle', 'metaDescription', 'ogTitle', 'ogDescription', 'twitterTitle', 'twitterDescription', 'jsonLdSchema', 'ctaVariants']
                }
              },
              required: ['title', 'heroAnswer', 'content', 'metadata']
            }
          }
        ],
        function_call: { name: 'format_content' }
      }),
    });

    const data = await openaiResponse.json();
    console.log("OpenAI response received");
    
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
      
      // Validate the schema
      const schemaValidation = validateSchema(functionArgs.metadata?.jsonLdSchema);
      
      // Add validation results to the returned data
      functionArgs.schemaValidation = schemaValidation;
      
      // If there are issues with the schema, try to fix them or add warnings
      if (!schemaValidation.isValid && functionArgs.metadata?.jsonLdSchema) {
        console.log("Schema validation issues:", schemaValidation.issues);
        // Add the validation issues to the response but don't block content generation
        functionArgs.metadata.schemaWarnings = schemaValidation.issues;
      }
      
      // Generate embedding for the content
      const contentForEmbedding = `${functionArgs.title} ${functionArgs.heroAnswer} ${functionArgs.content.replace(/<[^>]*>/g, ' ')}`;
      
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
        // Continue even if embedding fails
        console.log("Proceeding without embedding");
      } else {
        // Add embedding to the return data
        functionArgs.embedding = embeddingData.data[0].embedding;
        console.log("Embedding generated successfully");
      }
      
      // Return the formatted content with embedding
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
    console.error("Error in generate-content function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
