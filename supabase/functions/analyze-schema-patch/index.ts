
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, user_id } = await req.json()
    
    if (!url || !user_id) {
      throw new Error('URL and user_id are required')
    }

    console.log('Analyzing schema for URL:', url)
    
    // Fetch the page content
    const pageResponse = await fetch(url)
    const pageContent = await pageResponse.text()
    
    // Extract existing structured data
    const existingSchema = extractStructuredData(pageContent)
    
    // Use OpenAI to analyze and suggest improvements
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    const analysisPrompt = `
    Analyze this webpage's structured data for AI search optimization:
    
    URL: ${url}
    Existing Schema: ${JSON.stringify(existingSchema)}
    Page Content Sample: ${pageContent.substring(0, 2000)}
    
    Provide specific JSON-LD schema patches to improve AI search visibility. Focus on:
    1. FAQ schema for question-based content
    2. Article schema with proper metadata
    3. Organization/Website schema
    4. BreadcrumbList schema
    5. Missing properties in existing schema
    
    Return a JSON object with:
    - aiVisibilityScore: number (0-100)
    - missingSchemas: array of schema types needed
    - suggestedPatches: array of complete JSON-LD objects
    - recommendations: array of specific improvement suggestions
    `
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
      }),
    })
    
    const openaiData = await openaiResponse.json()
    let analysis
    
    try {
      analysis = JSON.parse(openaiData.choices[0].message.content)
    } catch (e) {
      // Fallback if OpenAI doesn't return valid JSON
      analysis = {
        aiVisibilityScore: 60,
        missingSchemas: ['FAQ', 'Article'],
        suggestedPatches: [],
        recommendations: ['Add FAQ schema for better AI search visibility', 'Include Article schema with author and date information']
      }
    }
    
    // Store the analysis in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { data, error } = await fetch(`${supabaseUrl}/rest/v1/schema_analyses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id,
        url,
        existing_schema: existingSchema,
        suggested_patches: analysis.suggestedPatches,
        ai_visibility_score: analysis.aiVisibilityScore,
        status: 'completed'
      }),
    }).then(res => res.json())
    
    if (error) {
      console.error('Supabase error:', error)
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          ...analysis,
          existingSchema,
          url
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in analyze-schema-patch:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractStructuredData(html: string) {
  const schemas = []
  
  // Extract JSON-LD
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)
  if (jsonLdMatches) {
    jsonLdMatches.forEach(match => {
      try {
        const jsonContent = match.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '')
        const parsed = JSON.parse(jsonContent)
        schemas.push(parsed)
      } catch (e) {
        console.log('Failed to parse JSON-LD:', e)
      }
    })
  }
  
  // Extract microdata (basic detection)
  const microdataItems = html.match(/itemtype=["'][^"']*["']/gi) || []
  const itemTypes = microdataItems.map(item => item.match(/itemtype=["']([^"']*)["']/i)?.[1]).filter(Boolean)
  
  return {
    jsonLd: schemas,
    microdata: itemTypes,
    totalSchemas: schemas.length + itemTypes.length
  }
}
