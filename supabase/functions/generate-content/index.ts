
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Marketing Copy Amplifier class
class MarketingAmplifier {
  constructor() {
    this.powerWords = {
      'good': ['explosive', 'game-changing', 'revolutionary', 'breakthrough'],
      'great': ['ultimate', 'elite', 'cutting-edge', 'dominant'],
      'effective': ['proven', 'guaranteed', 'instant', 'unstoppable'],
      'useful': ['transformative', 'life-changing', 'powerful', 'insider'],
      'new': ['revolutionary', 'breakthrough', 'cutting-edge', 'next-generation'],
      'important': ['crucial', 'critical', 'essential', 'must-have'],
      'help': ['transform', 'skyrocket', 'explode', 'dominate'],
      'improve': ['revolutionize', 'transform', 'supercharge', 'amplify'],
      'increase': ['explode', 'skyrocket', 'multiply', 'double'],
      'make': ['create', 'build', 'engineer', 'craft']
    };
    
    this.viralHooks = [
      "Stop scrolling. This {topic} secret will {benefit}...",
      "Everything you've been told about {topic} is wrong. Here's why...",
      "The #1 {topic} trick that experts don't want you to know...",
      "How I {achieved_result} in {timeframe} using this weird {method}...",
      "You won't believe what happened when I tried this {topic} hack...",
      "Why smart businesses are ditching {old_method} for this {new_method}...",
      "The shocking reason your {problem} isn't working (and the easy fix)...",
      "Want to {desired_outcome}? This is how you do it...",
      "I tested {number} {methods} so you don't have to. Here's the winner...",
      "Nobody is talking about this {topic} strategy, but they should be..."
    ];
    
    this.patternInterrupts = [
      "Stop scrolling.",
      "Listen up!",
      "You won't believe this...",
      "Here's something crazy:",
      "Plot twist:",
      "Breaking news:",
      "Confession time:",
      "Real talk:",
      "Here's the thing nobody tells you:",
      "This just happened..."
    ];
    
    this.psychologicalTriggers = {
      'urgency': ['Act now', 'Limited time', 'Don\'t wait', 'Grab this today'],
      'scarcity': ['Only available now', 'Exclusive access', 'Before it\'s gone'],
      'social_proof': ['Thousands are using', 'Industry leaders choose', 'Top experts recommend'],
      'curiosity': ['The secret is', 'What you don\'t know', 'Hidden truth about'],
      'authority': ['Proven by experts', 'Industry-tested', 'Professional-grade'],
      'fear_of_missing_out': ['While others struggle', 'Don\'t get left behind', 'Join the winners']
    };
    
    this.powerCtas = [
      "Start dominating now",
      "Grab your unfair advantage", 
      "Get instant access",
      "Claim your spot",
      "Download the blueprint",
      "Unlock the secrets",
      "Get the inside scoop",
      "Start crushing it today"
    ];
  }
  
  amplifyWithPowerWords(text) {
    let amplified = text;
    
    for (const [weakWord, powerAlternatives] of Object.entries(this.powerWords)) {
      const regex = new RegExp(`\\b${weakWord}\\b`, 'gi');
      if (regex.test(amplified)) {
        const replacement = powerAlternatives[Math.floor(Math.random() * powerAlternatives.length)];
        amplified = amplified.replace(regex, replacement);
      }
    }
    
    return amplified;
  }
  
  addViralHooks(text) {
    const sentences = text.split('.');
    if (!sentences.length) return text;
    
    const firstSentence = sentences[0].trim();
    
    if (firstSentence.length > 10) {
      const words = firstSentence.toLowerCase().split();
      const topicCandidates = words.filter(word => word.length > 4 && /^[a-zA-Z]+$/.test(word));
      const topic = topicCandidates[0] || "strategy";
      
      const hookTemplate = this.viralHooks[Math.floor(Math.random() * this.viralHooks.length)];
      
      const viralHook = hookTemplate
        .replace('{topic}', topic)
        .replace('{benefit}', 'change everything')
        .replace('{achieved_result}', 'doubled my results')
        .replace('{timeframe}', '30 days')
        .replace('{method}', 'technique')
        .replace('{old_method}', 'outdated tactics')
        .replace('{new_method}', 'proven system')
        .replace('{problem}', 'strategy')
        .replace('{desired_outcome}', 'dominate your market')
        .replace('{number}', '10')
        .replace('{methods}', 'approaches');
      
      sentences[0] = viralHook;
    }
    
    return sentences.join('.');
  }
  
  addPatternInterrupts(text) {
    const paragraphs = text.split('\n\n');
    const enhancedParagraphs = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      if (paragraph.trim().length > 0) {
        if (i > 0 && i % 3 === 0) {
          const interrupt = this.patternInterrupts[Math.floor(Math.random() * this.patternInterrupts.length)];
          enhancedParagraphs.push(`${interrupt} ${paragraph}`);
        } else {
          enhancedParagraphs.push(paragraph);
        }
      }
    }
    
    return enhancedParagraphs.join('\n\n');
  }
  
  addPsychologicalTriggers(text) {
    let triggeredText = text;
    
    const ctaPattern = /\b(click|try|start|get|download|sign up)\b/gi;
    const urgencyTriggers = this.psychologicalTriggers.urgency;
    
    triggeredText = triggeredText.replace(ctaPattern, (match) => {
      const trigger = urgencyTriggers[Math.floor(Math.random() * urgencyTriggers.length)];
      return `${trigger} - ${match}`;
    });
    
    if (/people|users/i.test(triggeredText)) {
      const proof = this.psychologicalTriggers.social_proof[Math.floor(Math.random() * this.psychologicalTriggers.social_proof.length)];
      triggeredText = triggeredText.replace(/people/i, `${proof} people`);
    }
    
    return triggeredText;
  }
  
  createCuriosityGaps(text) {
    const sentences = text.split('.');
    const gappedSentences = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (sentence.trim().length > 20 && i < sentences.length - 1) {
        if (i > 0 && i % 4 === 0) {
          gappedSentences.push(sentence + "... (but here's what's really interesting)");
        } else if (i % 5 === 0) {
          gappedSentences.push(sentence + "... and what happened next will surprise you");
        } else {
          gappedSentences.push(sentence);
        }
      } else {
        gappedSentences.push(sentence);
      }
    }
    
    return gappedSentences.join('.');
  }
  
  addPowerCtas(text) {
    const weakCtas = ['learn more', 'click here', 'read more', 'find out', 'see more', 'get started', 'try it', 'check it out'];
    let ctaEnhanced = text;
    
    for (const weakCta of weakCtas) {
      const regex = new RegExp(weakCta, 'gi');
      if (regex.test(ctaEnhanced)) {
        const powerCta = this.powerCtas[Math.floor(Math.random() * this.powerCtas.length)];
        ctaEnhanced = ctaEnhanced.replace(regex, powerCta);
        break; // Only replace one per pass
      }
    }
    
    return ctaEnhanced;
  }
  
  amplifyToMarketingCopy(text) {
    console.log("🔍 Analyzing text for weak language patterns...");
    let step1 = this.amplifyWithPowerWords(text);
    
    console.log("⚡ Injecting power words and viral hooks...");
    let step2 = this.addViralHooks(step1);
    
    console.log("🎯 Adding pattern interrupts and psychological triggers...");
    let step3 = this.addPatternInterrupts(step2);
    let step4 = this.addPsychologicalTriggers(step3);
    
    console.log("🧲 Creating curiosity gaps and power CTAs...");
    let step5 = this.createCuriosityGaps(step4);
    let finalText = this.addPowerCtas(step5);
    
    return {
      original: text,
      amplified: finalText,
      conversionReady: true
    };
  }
}

// Enhanced schema validation function with AEO requirements
function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    return { isValid: false, issues: ["Schema must be an object"] };
  }
  
  const issues = [];
  
  // Basic schema validation
  if (!schema['@context']) issues.push("Missing @context property for machine readability");
  if (!schema['@type']) issues.push("Missing @type property for content classification");
  
  // AEO-specific validation
  if (schema['@type'] === 'FAQPage') {
    if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
      issues.push("FAQPage schema must include mainEntity array for Answer Engine Optimization");
    } else {
      schema.mainEntity.forEach((qa, index) => {
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
const getComprehensiveContentPrompt = (topic, contentType, toneStyle, targetAudience, keywords) => {
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
    
    console.log('🚀 Running Marketing Copy Amplifier...');

    // STEP 2: Apply Marketing Copy Amplifier
    const amplifier = new MarketingAmplifier();
    const amplificationResult = amplifier.amplifyToMarketingCopy(initialContent.content);
    
    // Update content with amplified version
    initialContent.content = amplificationResult.amplified;
    console.log("✅ Content amplified with viral hooks and psychological triggers");
    
    // Also amplify the hero answer
    if (initialContent.heroAnswer) {
      const heroAmplified = amplifier.amplifyWithPowerWords(initialContent.heroAnswer);
      initialContent.heroAnswer = heroAmplified;
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
      console.log('Storing amplified marketing-focused content in database...');
      
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
        console.log('Amplified marketing content stored successfully with ID:', insertData.id);
        initialContent.id = insertData.id;
      }
    }
    
    return new Response(JSON.stringify(initialContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in marketing-amplified content generation:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
