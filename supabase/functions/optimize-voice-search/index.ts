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
    const { content, target_keywords = '', business_location = '', user_id, comprehensive = false } = await req.json()
    
    if (!content || !user_id) {
      throw new Error('Content and user_id are required')
    }

    console.log('Optimizing content for voice search')
    
    // Analyze voice search optimization potential
    const analysis = analyzeVoiceSearchOptimization(content, target_keywords, business_location);
    
    // Generate voice search keywords
    const voiceKeywords = generateVoiceSearchKeywords(content, target_keywords, business_location);
    
    // Create optimized content versions
    const optimizedContent = generateVoiceOptimizedContent(content, target_keywords, business_location);
    
    // Generate recommendations
    const recommendations = generateVoiceSearchRecommendations(analysis, content, business_location);

    const result = {
      success: true,
      analysis: {
        conversationalScore: analysis.conversationalScore,
        localOptimization: analysis.localOptimization,
        questionBasedContent: analysis.questionBasedContent,
        naturalLanguageScore: analysis.naturalLanguageScore,
        voiceKeywords,
        optimizedContent,
        recommendations
      },
      timestamp: new Date().toISOString()
    };

    // Store optimization results
    await storeVoiceOptimizationResults({
      user_id,
      content,
      target_keywords,
      business_location,
      analysis: result.analysis,
      comprehensive
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in optimize-voice-search:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function analyzeVoiceSearchOptimization(content: string, targetKeywords: string, businessLocation: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Conversational Score Analysis
  let conversationalScore = 0;
  
  // Check for conversational keywords
  const conversationalWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can', 'will', 'should'];
  const conversationalCount = conversationalWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  conversationalScore += Math.min(conversationalCount * 8, 40);
  
  // Check for natural language patterns
  const naturalPatterns = [
    /you can|you should|you need|you might/gi,
    /it's important|it's best|it's recommended/gi,
    /the best way|a great way|the easiest way/gi,
    /let me|let's|here's how/gi
  ];
  
  naturalPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      conversationalScore += 15;
    }
  });

  // Check sentence length (shorter is better for voice)
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength <= 15) {
    conversationalScore += 20;
  } else if (avgSentenceLength <= 25) {
    conversationalScore += 10;
  }

  // Local Optimization Analysis
  let localOptimization = 0;
  
  if (businessLocation) {
    const locationWords = businessLocation.toLowerCase().split(/[\s,]+/);
    const hasLocationMentions = locationWords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (hasLocationMentions) {
      localOptimization += 30;
    }
  }
  
  // Check for local intent keywords
  const localKeywords = ['near me', 'nearby', 'local', 'in my area', 'close to', 'around here'];
  const localKeywordCount = localKeywords.filter(keyword => 
    content.toLowerCase().includes(keyword)
  ).length;
  localOptimization += Math.min(localKeywordCount * 15, 45);
  
  // Check for business hours, address, phone number patterns
  const businessPatterns = [
    /\b\d{1,2}:\d{2}\s*(am|pm)\b/gi, // Time patterns
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone patterns
    /\b\d+\s+[a-zA-Z\s]+(?:street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd)\b/gi // Address patterns
  ];
  
  businessPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      localOptimization += 10;
    }
  });

  // Question-Based Content Analysis
  let questionBasedContent = 0;
  
  // Count questions in content
  const questionMarks = (content.match(/\?/g) || []).length;
  questionBasedContent += Math.min(questionMarks * 10, 30);
  
  // Check for FAQ patterns
  const faqPatterns = [
    /frequently asked questions|faq/gi,
    /q:|a:|question:|answer:/gi,
    /common questions|popular questions/gi
  ];
  
  faqPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      questionBasedContent += 15;
    }
  });
  
  // Check for question-based headings
  const questionHeadings = content.match(/<h[1-6][^>]*>[^<]*\?[^<]*<\/h[1-6]>/gi) || [];
  questionBasedContent += Math.min(questionHeadings.length * 12, 36);

  // Natural Language Score Analysis
  let naturalLanguageScore = 0;
  
  // Check for contractions (more natural)
  const contractions = content.match(/\b\w+'\w+\b/g) || [];
  naturalLanguageScore += Math.min(contractions.length * 2, 20);
  
  // Check for personal pronouns
  const personalPronouns = ['you', 'your', 'we', 'our', 'I', 'me', 'us'];
  const pronounCount = personalPronouns.filter(pronoun => 
    new RegExp(`\\b${pronoun}\\b`, 'gi').test(content)
  ).length;
  naturalLanguageScore += Math.min(pronounCount * 3, 30);
  
  // Check for action verbs
  const actionVerbs = ['get', 'find', 'learn', 'discover', 'understand', 'choose', 'pick', 'select'];
  const verbCount = actionVerbs.filter(verb => 
    new RegExp(`\\b${verb}\\b`, 'gi').test(content)
  ).length;
  naturalLanguageScore += Math.min(verbCount * 4, 32);
  
  // Check for simple language patterns
  const complexWords = content.match(/\b\w{10,}\b/g) || [];
  const complexityPenalty = Math.min(complexWords.length * 2, 20);
  naturalLanguageScore = Math.max(0, naturalLanguageScore - complexityPenalty + 18);

  return {
    conversationalScore: Math.min(conversationalScore, 100),
    localOptimization: Math.min(localOptimization, 100),
    questionBasedContent: Math.min(questionBasedContent, 100),
    naturalLanguageScore: Math.min(naturalLanguageScore, 100)
  };
}

function generateVoiceSearchKeywords(content: string, targetKeywords: string, businessLocation: string) {
  const keywords = [];
  const baseKeywords = targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : [];
  
  // Extract key phrases from content
  const contentWords = content.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const wordFreq = contentWords.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Generate voice search variations
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who'];
  const baseQueries = [...baseKeywords, ...topWords.slice(0, 5)];

  baseQueries.forEach(keyword => {
    // Informational queries
    questionWords.forEach(qw => {
      keywords.push({
        keyword: `${qw} is ${keyword}`,
        searchVolume: Math.floor(Math.random() * 5000) + 500,
        difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
        intent: 'informational' as const,
        optimizedVersion: `${qw.charAt(0).toUpperCase() + qw.slice(1)} is ${keyword}? Let me explain...`
      });
    });

    // Local queries if location provided
    if (businessLocation) {
      keywords.push({
        keyword: `${keyword} near ${businessLocation}`,
        searchVolume: Math.floor(Math.random() * 3000) + 200,
        difficulty: ['easy', 'medium'][Math.floor(Math.random() * 2)],
        intent: 'local' as const,
        optimizedVersion: `Looking for ${keyword} near ${businessLocation}? You'll find what you need right here.`
      });
    }

    // Transactional queries
    ['buy', 'get', 'find', 'choose'].forEach(action => {
      keywords.push({
        keyword: `${action} ${keyword}`,
        searchVolume: Math.floor(Math.random() * 4000) + 300,
        difficulty: ['medium', 'hard'][Math.floor(Math.random() * 2)],
        intent: 'transactional' as const,
        optimizedVersion: `Want to ${action} ${keyword}? Here's exactly what you need to do.`
      });
    });
  });

  // Sort by search volume and return top results
  return keywords
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 12);
}

function generateVoiceOptimizedContent(content: string, targetKeywords: string, businessLocation: string) {
  // Generate conversational version
  const conversationalVersion = createConversationalVersion(content);
  
  // Generate question-answer pairs
  const questionAnswerPairs = generateQuestionAnswerPairs(content, targetKeywords);
  
  // Generate local variations
  const localVariations = generateLocalVariations(content, businessLocation);
  
  // Generate voice-friendly snippets
  const voiceFriendlySnippets = generateVoiceFriendlySnippets(content);

  return {
    conversationalVersion,
    questionAnswerPairs,
    localVariations,
    voiceFriendlySnippets
  };
}

function createConversationalVersion(content: string): string {
  let conversational = content;
  
  // Replace formal language with conversational
  const replacements = [
    [/\butilize\b/gi, 'use'],
    [/\bpurchase\b/gi, 'buy'],
    [/\bobtain\b/gi, 'get'],
    [/\bcommence\b/gi, 'start'],
    [/\bterminate\b/gi, 'end'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bdemonstrate\b/gi, 'show'],
    [/\bimplement\b/gi, 'set up'],
    [/\bsubsequently\b/gi, 'then'],
    [/\btherefore\b/gi, 'so'],
    [/\badditionally\b/gi, 'also'],
    [/\bfurthermore\b/gi, 'also'],
    [/\bhowever\b/gi, 'but'],
    [/\bnevertheless\b/gi, 'still']
  ];
  
  replacements.forEach(([formal, casual]) => {
    conversational = conversational.replace(formal, casual as string);
  });
  
  // Add conversational openers
  const sentences = conversational.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 0) {
    const openers = [
      "Here's what you need to know: ",
      "Let me break this down for you: ",
      "Simply put, ",
      "The bottom line is ",
      "Here's the deal: "
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];
    conversational = opener + sentences[0].trim() + '. ' + sentences.slice(1).join('. ');
  }
  
  return conversational;
}

function generateQuestionAnswerPairs(content: string, targetKeywords: string) {
  const pairs = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keywords = targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : [];
  
  // Generate common questions
  const questionTemplates = [
    "What is {keyword}?",
    "How does {keyword} work?",
    "Why is {keyword} important?",
    "When should you use {keyword}?",
    "Where can you find {keyword}?",
    "Who needs {keyword}?"
  ];
  
  keywords.forEach(keyword => {
    questionTemplates.slice(0, 2).forEach(template => {
      const question = template.replace('{keyword}', keyword);
      const answer = findRelevantAnswer(sentences, keyword) || 
        `${keyword} is an important topic that can help you achieve your goals. Here's what you need to know about it.`;
      
      pairs.push({ question, answer });
    });
  });
  
  // Add general questions from content
  if (pairs.length < 4) {
    const generalQuestions = [
      { question: "What should I know about this topic?", answer: sentences[0] || "This is an important topic to understand." },
      { question: "How can this help me?", answer: sentences[1] || "This can provide valuable benefits for your needs." }
    ];
    pairs.push(...generalQuestions);
  }
  
  return pairs.slice(0, 6);
}

function generateLocalVariations(content: string, businessLocation: string) {
  const variations = [];
  
  if (businessLocation) {
    const locationParts = businessLocation.split(',').map(p => p.trim());
    const city = locationParts[0];
    const state = locationParts[1];
    
    const templates = [
      `Looking for this service in ${city}? We've got you covered.`,
      `${city} residents can benefit from this solution.`,
      `Serving the ${city} area with professional service.`,
      `Available throughout ${city} and surrounding areas.`
    ];
    
    if (state) {
      templates.push(`Proudly serving ${city}, ${state} and the surrounding region.`);
    }
    
    variations.push(...templates);
  } else {
    // Generic local variations
    variations.push(
      "Available in your local area with personalized service.",
      "Find this service near you with local expertise.",
      "Local professionals ready to help with your needs.",
      "Serving your community with reliable solutions."
    );
  }
  
  return variations.slice(0, 4);
}

function generateVoiceFriendlySnippets(content: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const snippets = [];
  
  // Convert sentences to voice-friendly format
  sentences.slice(0, 6).forEach(sentence => {
    let snippet = sentence.trim();
    
    // Ensure it starts conversationally
    if (!snippet.match(/^(here|this|you|if|when|to)/i)) {
      snippet = "Here's what you should know: " + snippet.toLowerCase();
    }
    
    // Keep it short (under 25 words)
    const words = snippet.split(/\s+/);
    if (words.length > 25) {
      snippet = words.slice(0, 22).join(' ') + '...';
    }
    
    snippets.push(snippet);
  });
  
  return snippets;
}

function findRelevantAnswer(sentences: string[], keyword: string): string {
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
      return sentence.trim();
    }
  }
  return '';
}

function generateVoiceSearchRecommendations(analysis: any, content: string, businessLocation: string) {
  const recommendations = [];
  
  if (analysis.conversationalScore < 70) {
    recommendations.push({
      type: 'conversational',
      title: 'Improve Conversational Language',
      description: 'Use more natural, conversational language that matches how people speak.',
      priority: 'high',
      optimizedContent: 'Replace formal language with casual alternatives. Use contractions, personal pronouns, and simple sentence structures.'
    });
  }
  
  if (analysis.questionBasedContent < 60) {
    recommendations.push({
      type: 'content',
      title: 'Add Question-Based Content',
      description: 'Create FAQ sections and question-based headings to match voice search queries.',
      priority: 'high',
      optimizedContent: 'Add sections like "What is..." and "How to..." that directly answer common questions.'
    });
  }
  
  if (analysis.localOptimization < 50 && businessLocation) {
    recommendations.push({
      type: 'local',
      title: 'Enhance Local Optimization',
      description: 'Include more location-specific content and local intent keywords.',
      priority: 'medium',
      optimizedContent: `Include phrases like "in ${businessLocation}", "near me", and local landmarks in your content.`
    });
  }
  
  if (analysis.naturalLanguageScore < 65) {
    recommendations.push({
      type: 'technical',
      title: 'Simplify Language Structure',
      description: 'Use shorter sentences and simpler vocabulary for better voice recognition.',
      priority: 'medium',
      optimizedContent: 'Break long sentences into shorter ones. Use common words instead of complex terminology.'
    });
  }
  
  // Always include schema markup recommendation
  recommendations.push({
    type: 'technical',
    title: 'Implement Voice Search Schema',
    description: 'Add structured data markup specifically for voice search optimization.',
    priority: 'medium',
    optimizedContent: 'Add FAQ schema, speakable markup, and structured data for better voice search visibility.'
  });
  
  return recommendations;
}

async function storeVoiceOptimizationResults(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/voice_search_optimizations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        original_content: data.content,
        target_keywords: data.target_keywords,
        business_location: data.business_location,
        conversational_score: data.analysis.conversationalScore,
        local_optimization_score: data.analysis.localOptimization,
        question_based_content_score: data.analysis.questionBasedContent,
        natural_language_score: data.analysis.naturalLanguageScore,
        voice_keywords: data.analysis.voiceKeywords,
        optimized_content: data.analysis.optimizedContent,
        recommendations: data.analysis.recommendations,
        comprehensive: data.comprehensive,
        created_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store voice optimization results:', error);
  }
}