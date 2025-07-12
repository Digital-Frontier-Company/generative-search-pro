
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
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SchemaAnalyzer/1.0)'
      }
    })
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status} ${pageResponse.statusText}`)
    }
    
    const pageContent = await pageResponse.text()
    console.log('Page content length:', pageContent.length)
    
    // Extract existing structured data
    const existingSchema = extractStructuredData(pageContent)
    console.log('Existing schema found:', existingSchema)
    
    // Use OpenAI to analyze and suggest improvements
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }
    
    const analysisPrompt = `
    Analyze this webpage's structured data for AI search optimization:
    
    URL: ${url}
    Existing Schema: ${JSON.stringify(existingSchema)}
    Page Content Sample: ${pageContent.substring(0, 3000)}
    
    Provide specific JSON-LD schema patches to improve AI search visibility. Focus on:
    1. FAQ schema for question-based content
    2. Article schema with proper metadata
    3. Organization/Website schema
    4. BreadcrumbList schema
    5. Missing properties in existing schema
    
    Return ONLY a valid JSON object with:
    - aiVisibilityScore: number (0-100)
    - missingSchemas: array of schema types needed
    - suggestedPatches: array of complete JSON-LD objects
    - recommendations: array of specific improvement suggestions
    
    Do not include any markdown formatting or explanation text, just the JSON object.
    `
    
    console.log('Calling OpenAI API...')
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
        max_tokens: 2000,
      }),
    })
    
    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${openaiResponse.statusText}`)
    }
    
    const openaiData = await openaiResponse.json()
    console.log('OpenAI response received')
    
    let analysis
    
    try {
      const content = openaiData.choices[0].message.content
      console.log('Raw OpenAI content:', content)
      
      // Clean the content to extract just the JSON
      const jsonStart = content.indexOf('{')
      const jsonEnd = content.lastIndexOf('}') + 1
      const jsonContent = content.substring(jsonStart, jsonEnd)
      
      analysis = JSON.parse(jsonContent)
      console.log('Parsed analysis:', analysis)
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
      // Create a basic analysis based on what we found
      analysis = {
        aiVisibilityScore: existingSchema.totalSchemas > 0 ? 60 : 30,
        missingSchemas: existingSchema.totalSchemas === 0 ? ['Article', 'FAQ'] : ['FAQ'],
        suggestedPatches: generateBasicSchemaPatches(url, pageContent, existingSchema),
        recommendations: generateBasicRecommendations(existingSchema)
      }
    }
    
    // Store the analysis in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }
    
    console.log('Storing analysis in database...')
    const storeResponse = await fetch(`${supabaseUrl}/rest/v1/schema_analyses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id,
        url,
        existing_schema: existingSchema,
        suggested_patches: analysis.suggestedPatches,
        ai_visibility_score: analysis.aiVisibilityScore,
        status: 'completed'
      }),
    })
    
    if (!storeResponse.ok) {
      const errorText = await storeResponse.text()
      console.error('Supabase storage error:', errorText)
      throw new Error(`Failed to store analysis: ${storeResponse.status} ${errorText}`)
    }
    
    const storedData = await storeResponse.json()
    console.log('Analysis stored successfully:', storedData)
    
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
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
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
        let jsonContent = match.trim();
        let previous;
        do {
          previous = jsonContent;
          jsonContent = jsonContent.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        } while (jsonContent !== previous);
        jsonContent = jsonContent.trim();
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

function generateBasicSchemaPatches(url: string, content: string, existingSchema: any) {
  const patches = []
  
  // Extract title from content
  const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'Website'
  
  // Extract description from meta tag
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  const description = descMatch ? descMatch[1].trim() : `Information about ${title}`
  
  // Add basic Article schema if missing
  if (!existingSchema.jsonLd.some((schema: any) => 
    ['Article', 'BlogPosting', 'NewsArticle'].includes(schema['@type']))) {
    patches.push({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "url": url,
      "author": {
        "@type": "Organization",
        "name": "Website"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Website"
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString()
    })
  }
  
  // Add basic FAQ schema if content seems to have questions
  const hasQuestions = /\?/g.test(content) && content.match(/\?/g).length > 2
  if (hasQuestions && !existingSchema.jsonLd.some((schema: any) => schema['@type'] === 'FAQPage')) {
    patches.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is this page about?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": description
          }
        }
      ]
    })
  }
  
  return patches
}

function generateBasicRecommendations(existingSchema: any) {
  const recommendations = []
  
  if (existingSchema.totalSchemas === 0) {
    recommendations.push("Add basic structured data markup to improve AI search visibility")
    recommendations.push("Consider adding Article schema with proper metadata")
    recommendations.push("Add FAQ schema for question-based content")
  } else {
    recommendations.push("Enhance existing schema with additional properties")
    recommendations.push("Add author and publisher information to improve credibility")
    recommendations.push("Include publication dates for better content freshness signals")
  }
  
  if (!existingSchema.jsonLd.some((schema: any) => schema['@type'] === 'Organization')) {
    recommendations.push("Add Organization schema to establish entity information")
  }
  
  return recommendations
}
