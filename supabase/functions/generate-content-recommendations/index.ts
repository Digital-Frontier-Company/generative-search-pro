import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content_text } = await req.json();

    if (!content_text || typeof content_text !== 'string') {
      return new Response(JSON.stringify({ error: 'content_text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are an expert content strategist. Analyze the content below and return 3-5 actionable, specific recommendations to improve quality, SEO, and engagement. For each, include a brief "why it matters". Return as a simple numbered list.\n\nContent:\n${content_text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You provide concise, actionable SEO/content recommendations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'OpenAI API error');
    }

    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const recommendations = text
      .split('\n')
      .map((line: string) => line.replace(/^\s*\d+\.?\s*/, '').trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 5);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 
