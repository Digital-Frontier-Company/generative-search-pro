
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
    const { query, domain, user_id } = await req.json()
    
    if (!query || !domain || !user_id) {
      throw new Error('Query, domain, and user_id are required')
    }

    console.log('Checking SGE citation for:', { query, domain })
    
    // Use SerpApi to get Google SGE results
    const serpApiKey = Deno.env.get('SERPAPI_KEY')
    
    if (!serpApiKey) {
      throw new Error('SerpApi key not configured. Please add SERPAPI_KEY to your environment variables.')
    }
    
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&gl=us&hl=en`
    
    const serpResponse = await fetch(serpApiUrl)
    const serpData = await serpResponse.json()
    
    // Check if domain appears in AI answer or cited sources
    let isCited = false
    let aiAnswer = ''
    let citedSources = []
    let recommendations = ''
    
    // Check AI overview/SGE results
    if (serpData.ai_overview) {
      aiAnswer = serpData.ai_overview.overview || ''
      citedSources = serpData.ai_overview.sources || []
      
      // Check if domain is cited
      isCited = citedSources.some((source: any) => 
        source.link && source.link.includes(domain)
      ) || aiAnswer.toLowerCase().includes(domain.toLowerCase())
    }
    
    // If not cited, get AI recommendations
    if (!isCited) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
      
      const recommendationPrompt = `
      Query: "${query}"
      Domain: ${domain}
      AI Answer: ${aiAnswer}
      Cited Sources: ${JSON.stringify(citedSources)}
      
      The domain ${domain} was not cited in Google's AI answer for this query. 
      Provide specific, actionable recommendations to improve the chances of being cited.
      Focus on:
      1. Content gaps compared to cited sources
      2. Schema markup suggestions
      3. Content format improvements (FAQ, step-by-step guides, etc.)
      4. Authority building tactics
      
      Keep recommendations practical and specific.
      `
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: recommendationPrompt }],
          temperature: 0.3,
        }),
      })
      
      const openaiData = await openaiResponse.json()
      recommendations = openaiData.choices[0].message.content
    }
    
    // Store the citation check in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/citation_checks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id,
        query,
        domain,
        is_cited: isCited,
        ai_answer: aiAnswer,
        cited_sources: citedSources,
        recommendations: recommendations
      }),
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        result: {
          query,
          domain,
          isCited,
          aiAnswer,
          citedSources,
          recommendations,
          checkedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in check-sge-citation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
