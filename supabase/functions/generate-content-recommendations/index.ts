import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from "https://deno.land/x/openai/mod.ts";

const openAIKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content_text } = await req.json();
    const openai = new OpenAI(openAIKey);

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Analyze the following content and provide 3-5 actionable recommendations to improve its quality, SEO, and engagement. For each recommendation, briefly explain why it's important. Frame the recommendations as if you are an expert content strategist. \n\nContent:\n${content_text}\n\nRecommendations:`,
      max_tokens: 250,
      temperature: 0.7,
    });

    const recommendations = completion.choices[0].text.trim().split('\n').filter(rec => rec.length > 0);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 