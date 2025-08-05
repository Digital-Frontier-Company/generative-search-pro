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
    const { content, target_query, user_id, optimization_level = 'standard' } = await req.json()
    
    if (!content || !target_query || !user_id) {
      throw new Error('Content, target_query, and user_id are required')
    }

    console.log('Optimizing content for zero-click visibility:', target_query)
    
    // Analyze current content for zero-click potential
    const analysis = analyzeZeroClickPotential(content, target_query);
    
    // Generate optimized content versions
    const optimizedContent = await generateOptimizedVersions(content, target_query, optimization_level);
    
    // Generate specific recommendations
    const recommendations = generateZeroClickRecommendations(analysis, content, target_query);

    const result = {
      success: true,
      analysis: {
        snippetPotential: analysis.snippetPotential,
        answerBoxReadiness: analysis.answerBoxReadiness,
        voiceSearchOptimization: analysis.voiceSearchOptimization,
        structuredContentScore: analysis.structuredContentScore,
        recommendations,
        optimizedContent
      },
      timestamp: new Date().toISOString()
    };

    // Store optimization results
    await storeOptimizationResults({
      user_id,
      target_query,
      original_content: content,
      analysis: result.analysis,
      optimization_level
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in optimize-zero-click:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function analyzeZeroClickPotential(content: string, targetQuery: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // Featured Snippet Potential Analysis
  let snippetPotential = 0;
  
  // Check for direct answer patterns
  const hasDirectAnswer = content.toLowerCase().includes(targetQuery.toLowerCase()) && 
                         sentences.some(s => s.trim().length >= 40 && s.trim().length <= 60);
  if (hasDirectAnswer) snippetPotential += 30;
  
  // Check for list structures
  const hasLists = /(\n\s*[-*•]\s)|(\n\s*\d+\.\s)/.test(content);
  if (hasLists) snippetPotential += 25;
  
  // Check for step-by-step content
  const hasSteps = /step \d+|first|second|third|finally|lastly/i.test(content);
  if (hasSteps) snippetPotential += 20;
  
  // Check content length (sweet spot for snippets)
  if (words.length >= 40 && words.length <= 300) snippetPotential += 25;

  // Answer Box Readiness Analysis
  let answerBoxReadiness = 0;
  
  // Check for question-answer format
  const hasQuestions = /\?/.test(content);
  if (hasQuestions) answerBoxReadiness += 30;
  
  // Check for definition patterns
  const hasDefinitions = /(is defined as|refers to|means that|is a type of)/i.test(content);
  if (hasDefinitions) answerBoxReadiness += 25;
  
  // Check for comprehensive coverage
  if (words.length >= 100 && words.length <= 500) answerBoxReadiness += 25;
  
  // Check for authority signals
  const hasAuthority = /(according to|research shows|studies indicate|experts say)/i.test(content);
  if (hasAuthority) answerBoxReadiness += 20;

  // Voice Search Optimization Analysis
  let voiceSearchOptimization = 0;
  
  // Check for conversational language
  const conversationalWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
  const conversationalCount = conversationalWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  voiceSearchOptimization += Math.min(conversationalCount * 5, 30);
  
  // Check for natural language patterns
  const hasNaturalLanguage = /(you can|it's important|the best way)/i.test(content);
  if (hasNaturalLanguage) voiceSearchOptimization += 25;
  
  // Check for local context (important for voice search)
  const hasLocalContext = /(near me|locally|in your area|nearby)/i.test(content);
  if (hasLocalContext) voiceSearchOptimization += 20;
  
  // Check sentence length (shorter is better for voice)
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength <= 20) voiceSearchOptimization += 25;

  // Structured Content Score Analysis
  let structuredContentScore = 0;
  
  // Check for headings structure
  const hasHeadings = /#{1,6}\s/.test(content) || /<h[1-6]/.test(content);
  if (hasHeadings) structuredContentScore += 30;
  
  // Check for proper paragraph structure
  if (paragraphs.length >= 2 && paragraphs.every(p => p.trim().length >= 50)) {
    structuredContentScore += 25;
  }
  
  // Check for logical flow
  const hasTransitions = /(however|therefore|additionally|furthermore|in conclusion)/i.test(content);
  if (hasTransitions) structuredContentScore += 25;
  
  // Check for content completeness
  if (words.length >= 150 && sentences.length >= 5) structuredContentScore += 20;

  return {
    snippetPotential: Math.min(snippetPotential, 100),
    answerBoxReadiness: Math.min(answerBoxReadiness, 100),
    voiceSearchOptimization: Math.min(voiceSearchOptimization, 100),
    structuredContentScore: Math.min(structuredContentScore, 100)
  };
}

async function generateOptimizedVersions(content: string, targetQuery: string, level: string) {
  // Generate direct answer (40-50 words)
  const directAnswer = generateDirectAnswer(content, targetQuery);
  
  // Generate featured snippet version
  const featuredSnippetVersion = generateFeaturedSnippetVersion(content, targetQuery);
  
  // Generate FAQ structure
  const faqStructure = generateFAQStructure(content, targetQuery);
  
  // Generate list format
  const listFormat = generateListFormat(content);
  
  // Generate voice search friendly version
  const voiceSearchFriendly = generateVoiceSearchVersion(content, targetQuery);

  return {
    directAnswer,
    featuredSnippetVersion,
    faqStructure,
    listFormat,
    voiceSearchFriendly
  };
}

function generateDirectAnswer(content: string, targetQuery: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Find the most relevant sentence that answers the query
  let bestSentence = sentences[0] || content;
  let maxRelevance = 0;
  
  const queryWords = targetQuery.toLowerCase().split(/\s+/);
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.toLowerCase().split(/\s+/);
    const relevance = queryWords.filter(word => 
      sentenceWords.some(sw => sw.includes(word) || word.includes(sw))
    ).length;
    
    if (relevance > maxRelevance && sentence.trim().length >= 30) {
      maxRelevance = relevance;
      bestSentence = sentence;
    }
  }
  
  // Trim to 40-50 words
  const words = bestSentence.trim().split(/\s+/);
  if (words.length > 50) {
    return words.slice(0, 48).join(' ') + '...';
  } else if (words.length < 40) {
    // Try to expand with context
    const index = sentences.indexOf(bestSentence);
    if (index > 0 && words.length < 40) {
      const prevWords = sentences[index - 1].split(/\s+/);
      const combined = [...prevWords.slice(-10), ...words];
      if (combined.length <= 50) {
        return combined.join(' ');
      }
    }
  }
  
  return bestSentence.trim();
}

function generateFeaturedSnippetVersion(content: string, targetQuery: string): string {
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  // Create a structured answer
  let structuredAnswer = `${targetQuery}:\n\n`;
  
  // Add direct answer first
  const directAnswer = generateDirectAnswer(content, targetQuery);
  structuredAnswer += `${directAnswer}\n\n`;
  
  // Add key points in list format
  const keyPoints = extractKeyPoints(content);
  if (keyPoints.length > 0) {
    structuredAnswer += "Key points:\n";
    keyPoints.slice(0, 5).forEach((point, index) => {
      structuredAnswer += `${index + 1}. ${point}\n`;
    });
  }
  
  return structuredAnswer.trim();
}

function generateFAQStructure(content: string, targetQuery: string) {
  const faqs = [];
  
  // Main question
  faqs.push({
    question: targetQuery,
    answer: generateDirectAnswer(content, targetQuery)
  });
  
  // Generate related questions
  const relatedQuestions = generateRelatedQuestions(targetQuery, content);
  relatedQuestions.forEach(q => {
    faqs.push({
      question: q.question,
      answer: q.answer
    });
  });
  
  return faqs;
}

function generateListFormat(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keyPoints = extractKeyPoints(content);
  
  if (keyPoints.length >= 3) {
    return keyPoints;
  }
  
  // Fallback: convert sentences to list items
  return sentences.slice(0, 5).map(s => s.trim());
}

function generateVoiceSearchVersion(content: string, targetQuery: string): string {
  // Make it conversational and direct
  const directAnswer = generateDirectAnswer(content, targetQuery);
  
  // Add conversational elements
  const conversationalStarters = [
    "Well, ",
    "Simply put, ",
    "The answer is ",
    "Here's what you need to know: ",
    "To put it briefly, "
  ];
  
  const starter = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)];
  
  // Make it sound natural for voice
  let voiceAnswer = starter + directAnswer;
  
  // Replace formal language with conversational
  voiceAnswer = voiceAnswer
    .replace(/\b(utilize|utilizes)\b/g, 'use')
    .replace(/\b(subsequently|consequently)\b/g, 'then')
    .replace(/\b(therefore)\b/g, 'so')
    .replace(/\b(additionally)\b/g, 'also');
  
  return voiceAnswer;
}

function extractKeyPoints(content: string): string[] {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const points = [];
  
  // Look for list patterns
  const listMatches = content.match(/(?:^|\n)\s*[-*•]\s*(.+)$/gm);
  if (listMatches) {
    points.push(...listMatches.map(match => match.replace(/^[-*•]\s*/, '').trim()));
  }
  
  // Look for numbered lists
  const numberedMatches = content.match(/(?:^|\n)\s*\d+\.\s*(.+)$/gm);
  if (numberedMatches) {
    points.push(...numberedMatches.map(match => match.replace(/^\d+\.\s*/, '').trim()));
  }
  
  // If no lists found, extract important sentences
  if (points.length === 0) {
    const importantSentences = sentences.filter(s => 
      s.length >= 30 && s.length <= 150 && 
      (s.includes('important') || s.includes('key') || s.includes('essential') || s.includes('must'))
    );
    points.push(...importantSentences.slice(0, 5));
  }
  
  return points;
}

function generateRelatedQuestions(mainQuery: string, content: string) {
  const questions = [];
  
  // Extract existing questions from content
  const existingQuestions = content.match(/[^.!]*\?/g);
  if (existingQuestions) {
    questions.push(...existingQuestions.slice(0, 2).map(q => ({
      question: q.trim(),
      answer: generateDirectAnswer(content, q.replace('?', ''))
    })));
  }
  
  // Generate common variations
  const baseQuery = mainQuery.toLowerCase().replace(/^(what|how|why|when|where|who)\s+/, '');
  const variations = [
    `How does ${baseQuery} work?`,
    `Why is ${baseQuery} important?`,
    `What are the benefits of ${baseQuery}?`
  ];
  
  variations.forEach(variation => {
    if (questions.length < 3) {
      questions.push({
        question: variation,
        answer: generateDirectAnswer(content, variation)
      });
    }
  });
  
  return questions;
}

function generateZeroClickRecommendations(analysis: any, content: string, targetQuery: string) {
  const recommendations = [];
  
  if (analysis.snippetPotential < 70) {
    recommendations.push({
      type: 'featured_snippet',
      title: 'Optimize for Featured Snippets',
      description: 'Add a clear, direct answer (40-50 words) at the beginning of your content that directly addresses the target query.',
      priority: 'high',
      optimizedContent: generateDirectAnswer(content, targetQuery)
    });
  }
  
  if (analysis.answerBoxReadiness < 60) {
    recommendations.push({
      type: 'answer_box',
      title: 'Improve Answer Box Potential',
      description: 'Structure your content with clear definitions and comprehensive answers to question-based queries.',
      priority: 'high',
      optimizedContent: `${targetQuery}: ${generateDirectAnswer(content, targetQuery)}`
    });
  }
  
  if (analysis.voiceSearchOptimization < 65) {
    recommendations.push({
      type: 'voice_search',
      title: 'Optimize for Voice Search',
      description: 'Use conversational language and natural speech patterns that match how people ask questions verbally.',
      priority: 'medium',
      optimizedContent: generateVoiceSearchVersion(content, targetQuery)
    });
  }
  
  if (analysis.structuredContentScore < 70) {
    recommendations.push({
      type: 'faq',
      title: 'Add FAQ Structure',
      description: 'Create a clear FAQ section with question-answer pairs related to your main topic.',
      priority: 'medium',
      optimizedContent: 'Q: ' + targetQuery + '\nA: ' + generateDirectAnswer(content, targetQuery)
    });
  }
  
  return recommendations;
}

async function storeOptimizationResults(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/zero_click_optimizations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        target_query: data.target_query,
        original_content: data.original_content,
        snippet_potential: data.analysis.snippetPotential,
        answer_box_readiness: data.analysis.answerBoxReadiness,
        voice_search_optimization: data.analysis.voiceSearchOptimization,
        structured_content_score: data.analysis.structuredContentScore,
        optimized_versions: data.analysis.optimizedContent,
        recommendations: data.analysis.recommendations,
        optimization_level: data.optimization_level,
        created_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store optimization results:', error);
  }
}