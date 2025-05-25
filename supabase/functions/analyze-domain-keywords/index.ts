
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeywordData {
  word: string;
  count: number;
  percentage: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, user_id } = await req.json();

    if (!domain) {
      throw new Error('Domain is required');
    }

    console.log('Analyzing domain:', domain);

    // Normalize domain URL
    let url = domain;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Fetch website content
    console.log('Fetching content from:', url);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log('Fetched HTML content, length:', html.length);

    // Use GPT to analyze the content and extract keywords
    console.log('Sending to OpenAI for analysis...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a keyword analysis expert. Analyze the provided HTML content and extract meaningful keywords with their frequency data.

IMPORTANT INSTRUCTIONS:
1. Extract only meaningful words (3+ characters)
2. Exclude common stop words (the, and, or, but, etc.)
3. Focus on nouns, adjectives, and meaningful verbs
4. Calculate accurate word counts and percentages
5. Return exactly 50 top keywords by frequency
6. Respond ONLY with valid JSON in this exact format:

{
  "totalWords": number,
  "keywords": [
    {"word": "example", "count": 25, "percentage": 5.2}
  ]
}

Do not include any other text, explanations, or formatting.`
          },
          {
            role: 'user',
            content: `Analyze this HTML content for keyword frequency:\n\n${html.substring(0, 16000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${gptResponse.status}`);
    }

    const gptData = await gptResponse.json();
    console.log('OpenAI response received');
    
    const analysisText = gptData.choices[0].message.content.trim();
    console.log('Analysis text:', analysisText.substring(0, 200));

    // Parse the JSON response from GPT
    let analysisData;
    try {
      analysisData = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      console.error('Raw response:', analysisText);
      throw new Error('Failed to parse keyword analysis results');
    }

    // Validate the response structure
    if (!analysisData.keywords || !Array.isArray(analysisData.keywords)) {
      throw new Error('Invalid analysis data structure');
    }

    // Ensure all keywords have required fields
    const validKeywords = analysisData.keywords.filter(k => 
      k.word && typeof k.count === 'number' && typeof k.percentage === 'number'
    ).slice(0, 50); // Limit to top 50

    const result = {
      domain: domain,
      totalWords: analysisData.totalWords || 0,
      keywords: validKeywords,
      analyzedAt: new Date().toISOString()
    };

    console.log('Analysis completed. Keywords found:', validKeywords.length);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-domain-keywords function:', error);
    
    let errorMessage = 'Failed to analyze domain';
    if (error.message.includes('fetch website')) {
      errorMessage = 'Unable to access the website. Please check the URL.';
    } else if (error.message.includes('OpenAI')) {
      errorMessage = 'AI analysis service unavailable. Please try again later.';
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
