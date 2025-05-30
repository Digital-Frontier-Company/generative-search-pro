
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
    const { domain, user_id } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Starting SEO analysis for domain:', domain)
    
    // Normalize domain
    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const fullUrl = `https://${normalizedDomain}`
    
    // Fetch the page content
    const pageResponse = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0)'
      }
    })
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status} ${pageResponse.statusText}`)
    }
    
    const pageContent = await pageResponse.text()
    console.log('Page content fetched, length:', pageContent.length)
    
    // Perform SEO analysis
    const seoAnalysis = performSEOAnalysis(pageContent, fullUrl)
    console.log('SEO analysis completed:', seoAnalysis)
    
    // Store the analysis in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }
    
    console.log('Storing SEO analysis in database...')
    
    // Insert main analysis
    const analysisResponse = await fetch(`${supabaseUrl}/rest/v1/seo_analyses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id,
        domain: normalizedDomain,
        technical_score: seoAnalysis.technicalScore,
        backlink_score: seoAnalysis.backlinkScore,
        total_score: seoAnalysis.totalScore,
        analysis_data: seoAnalysis.analysisData,
        status: 'completed'
      }),
    })
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Supabase analysis storage error:', errorText)
      throw new Error(`Failed to store analysis: ${analysisResponse.status} ${errorText}`)
    }
    
    const storedAnalysis = await analysisResponse.json()
    const analysisId = storedAnalysis[0].id
    console.log('Analysis stored successfully with ID:', analysisId)
    
    // Insert technical findings
    if (seoAnalysis.technicalFindings.length > 0) {
      const findingsResponse = await fetch(`${supabaseUrl}/rest/v1/technical_findings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(
          seoAnalysis.technicalFindings.map(finding => ({
            analysis_id: analysisId,
            finding_type: finding.type,
            status: finding.status,
            message: finding.message,
            url: finding.url
          }))
        ),
      })
      
      if (!findingsResponse.ok) {
        const errorText = await findingsResponse.text()
        console.error('Supabase findings storage error:', errorText)
      } else {
        console.log('Technical findings stored successfully')
      }
    }
    
    // Fetch the complete analysis with findings for response
    const completeAnalysisResponse = await fetch(
      `${supabaseUrl}/rest/v1/seo_analyses?id=eq.${analysisId}&select=*,technical_findings(*)`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
      }
    )
    
    if (!completeAnalysisResponse.ok) {
      throw new Error('Failed to fetch complete analysis')
    }
    
    const completeAnalysis = await completeAnalysisResponse.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: completeAnalysis[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in analyze-seo:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function performSEOAnalysis(html: string, url: string) {
  const technicalFindings = []
  let technicalScore = 100
  let backlinkScore = 50 // Default since we can't check backlinks easily
  
  // Check title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (!titleMatch) {
    technicalFindings.push({
      type: 'title_tag',
      status: 'error',
      message: 'Missing title tag',
      url
    })
    technicalScore -= 15
  } else {
    const title = titleMatch[1].trim()
    if (title.length < 30) {
      technicalFindings.push({
        type: 'title_tag',
        status: 'warning',
        message: 'Title tag is too short (less than 30 characters)',
        url
      })
      technicalScore -= 5
    } else if (title.length > 60) {
      technicalFindings.push({
        type: 'title_tag',
        status: 'warning',
        message: 'Title tag is too long (more than 60 characters)',
        url
      })
      technicalScore -= 5
    } else {
      technicalFindings.push({
        type: 'title_tag',
        status: 'good',
        message: 'Title tag length is optimal',
        url
      })
    }
  }
  
  // Check meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  if (!metaDescMatch) {
    technicalFindings.push({
      type: 'meta_description',
      status: 'error',
      message: 'Missing meta description',
      url
    })
    technicalScore -= 10
  } else {
    const description = metaDescMatch[1].trim()
    if (description.length < 120) {
      technicalFindings.push({
        type: 'meta_description',
        status: 'warning',
        message: 'Meta description is too short (less than 120 characters)',
        url
      })
      technicalScore -= 5
    } else if (description.length > 160) {
      technicalFindings.push({
        type: 'meta_description',
        status: 'warning',
        message: 'Meta description is too long (more than 160 characters)',
        url
      })
      technicalScore -= 5
    } else {
      technicalFindings.push({
        type: 'meta_description',
        status: 'good',
        message: 'Meta description length is optimal',
        url
      })
    }
  }
  
  // Check H1 tags
  const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi)
  if (!h1Matches) {
    technicalFindings.push({
      type: 'headings',
      status: 'error',
      message: 'Missing H1 tag',
      url
    })
    technicalScore -= 10
  } else if (h1Matches.length > 1) {
    technicalFindings.push({
      type: 'headings',
      status: 'warning',
      message: `Multiple H1 tags found (${h1Matches.length})`,
      url
    })
    technicalScore -= 5
  } else {
    technicalFindings.push({
      type: 'headings',
      status: 'good',
      message: 'Single H1 tag found',
      url
    })
  }
  
  // Check images alt attributes
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length
  if (imgsWithoutAlt > 0) {
    technicalFindings.push({
      type: 'images',
      status: 'warning',
      message: `${imgsWithoutAlt} images missing alt attributes`,
      url
    })
    technicalScore -= Math.min(imgsWithoutAlt * 2, 15)
  } else if (imgMatches.length > 0) {
    technicalFindings.push({
      type: 'images',
      status: 'good',
      message: 'All images have alt attributes',
      url
    })
  }
  
  // Check for structured data
  const structuredDataMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi)
  if (!structuredDataMatches) {
    technicalFindings.push({
      type: 'structured_data',
      status: 'warning',
      message: 'No structured data (JSON-LD) found',
      url
    })
    technicalScore -= 5
  } else {
    technicalFindings.push({
      type: 'structured_data',
      status: 'good',
      message: 'Structured data found',
      url
    })
  }
  
  // Ensure scores don't go below 0
  technicalScore = Math.max(0, technicalScore)
  
  const totalScore = Math.round((technicalScore + backlinkScore) / 2)
  
  return {
    technicalScore,
    backlinkScore,
    totalScore,
    technicalFindings,
    analysisData: {
      pageSize: html.length,
      imageCount: imgMatches.length,
      imagesWithoutAlt: imgsWithoutAlt,
      hasStructuredData: !!structuredDataMatches,
      titleLength: titleMatch ? titleMatch[1].trim().length : 0,
      metaDescriptionLength: metaDescMatch ? metaDescMatch[1].trim().length : 0,
      h1Count: h1Matches ? h1Matches.length : 0
    }
  }
}
