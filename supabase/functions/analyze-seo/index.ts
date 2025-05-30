
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
    
    // Perform enhanced SEO analysis
    const seoAnalysis = performEnhancedSEOAnalysis(pageContent, fullUrl)
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

function performEnhancedSEOAnalysis(html: string, url: string) {
  const technicalFindings = []
  let technicalScore = 100
  let backlinkScore = 50 // Default since we can't check backlinks easily
  
  // Enhanced title tag analysis
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
    if (title.length === 0) {
      technicalFindings.push({
        type: 'title_tag',
        status: 'error',
        message: 'Empty title tag',
        url
      })
      technicalScore -= 15
    } else if (title.length < 30) {
      technicalFindings.push({
        type: 'title_tag',
        status: 'warning',
        message: `Title tag is too short (${title.length} characters, recommended: 30-60)`,
        url
      })
      technicalScore -= 5
    } else if (title.length > 60) {
      technicalFindings.push({
        type: 'title_tag',
        status: 'warning',
        message: `Title tag is too long (${title.length} characters, recommended: 30-60)`,
        url
      })
      technicalScore -= 5
    } else {
      technicalFindings.push({
        type: 'title_tag',
        status: 'good',
        message: `Title tag length is optimal (${title.length} characters)`,
        url
      })
    }
  }
  
  // Enhanced meta description analysis
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
    if (description.length === 0) {
      technicalFindings.push({
        type: 'meta_description',
        status: 'error',
        message: 'Empty meta description',
        url
      })
      technicalScore -= 10
    } else if (description.length < 120) {
      technicalFindings.push({
        type: 'meta_description',
        status: 'warning',
        message: `Meta description is too short (${description.length} characters, recommended: 120-160)`,
        url
      })
      technicalScore -= 5
    } else if (description.length > 160) {
      technicalFindings.push({
        type: 'meta_description',
        status: 'warning',
        message: `Meta description is too long (${description.length} characters, recommended: 120-160)`,
        url
      })
      technicalScore -= 5
    } else {
      technicalFindings.push({
        type: 'meta_description',
        status: 'good',
        message: `Meta description length is optimal (${description.length} characters)`,
        url
      })
    }
  }
  
  // Check for other important meta tags
  const metaViewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i)
  if (!metaViewportMatch) {
    technicalFindings.push({
      type: 'meta_tags',
      status: 'warning',
      message: 'Missing viewport meta tag (important for mobile)',
      url
    })
    technicalScore -= 3
  } else {
    technicalFindings.push({
      type: 'meta_tags',
      status: 'good',
      message: 'Viewport meta tag found',
      url
    })
  }
  
  // Check for charset meta tag
  const metaCharsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i)
  if (!metaCharsetMatch) {
    technicalFindings.push({
      type: 'meta_tags',
      status: 'warning',
      message: 'Missing charset meta tag',
      url
    })
    technicalScore -= 2
  } else {
    technicalFindings.push({
      type: 'meta_tags',
      status: 'good',
      message: `Charset meta tag found: ${metaCharsetMatch[1]}`,
      url
    })
  }
  
  // Enhanced H1 analysis
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
      message: `Multiple H1 tags found (${h1Matches.length}). Consider using only one H1 per page.`,
      url
    })
    technicalScore -= 5
  } else {
    const h1Content = h1Matches[0].replace(/<[^>]*>/g, '').trim()
    technicalFindings.push({
      type: 'headings',
      status: 'good',
      message: `Single H1 tag found with content: "${h1Content.substring(0, 50)}${h1Content.length > 50 ? '...' : ''}"`,
      url
    })
  }
  
  // Check heading hierarchy
  const h2Matches = html.match(/<h2[^>]*>/gi) || []
  const h3Matches = html.match(/<h3[^>]*>/gi) || []
  const h4Matches = html.match(/<h4[^>]*>/gi) || []
  
  if (h2Matches.length > 0 || h3Matches.length > 0 || h4Matches.length > 0) {
    technicalFindings.push({
      type: 'headings',
      status: 'good',
      message: `Good heading structure: H1(${h1Matches ? h1Matches.length : 0}), H2(${h2Matches.length}), H3(${h3Matches.length}), H4(${h4Matches.length})`,
      url
    })
  }
  
  // Enhanced image analysis
  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length
  const imgsWithEmptyAlt = imgMatches.filter(img => img.match(/alt=["']?\s*["']?/)).length
  
  if (imgMatches.length === 0) {
    technicalFindings.push({
      type: 'images',
      status: 'info',
      message: 'No images found on the page',
      url
    })
  } else if (imgsWithoutAlt > 0) {
    technicalFindings.push({
      type: 'images',
      status: 'warning',
      message: `${imgsWithoutAlt} out of ${imgMatches.length} images missing alt attributes`,
      url
    })
    technicalScore -= Math.min(imgsWithoutAlt * 2, 15)
  } else if (imgsWithEmptyAlt > 0) {
    technicalFindings.push({
      type: 'images',
      status: 'warning',
      message: `${imgsWithEmptyAlt} out of ${imgMatches.length} images have empty alt attributes`,
      url
    })
    technicalScore -= Math.min(imgsWithEmptyAlt * 1, 10)
  } else {
    technicalFindings.push({
      type: 'images',
      status: 'good',
      message: `All ${imgMatches.length} images have alt attributes`,
      url
    })
  }
  
  // Enhanced structured data analysis
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([^<]*)<\/script>/gi)
  const microdataMatches = html.match(/itemscope|itemtype|itemprop/gi) || []
  
  if (!jsonLdMatches && microdataMatches.length === 0) {
    technicalFindings.push({
      type: 'structured_data',
      status: 'warning',
      message: 'No structured data (JSON-LD or Microdata) found',
      url
    })
    technicalScore -= 5
  } else {
    let structuredDataTypes = []
    if (jsonLdMatches) {
      structuredDataTypes.push(`JSON-LD (${jsonLdMatches.length} blocks)`)
    }
    if (microdataMatches.length > 0) {
      structuredDataTypes.push(`Microdata (${microdataMatches.length} elements)`)
    }
    technicalFindings.push({
      type: 'structured_data',
      status: 'good',
      message: `Structured data found: ${structuredDataTypes.join(', ')}`,
      url
    })
  }
  
  // Check for Open Graph tags
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  
  let ogTagsCount = 0
  if (ogTitleMatch) ogTagsCount++
  if (ogDescMatch) ogTagsCount++
  if (ogImageMatch) ogTagsCount++
  
  if (ogTagsCount === 0) {
    technicalFindings.push({
      type: 'social_tags',
      status: 'warning',
      message: 'No Open Graph tags found (important for social media sharing)',
      url
    })
    technicalScore -= 3
  } else if (ogTagsCount < 3) {
    technicalFindings.push({
      type: 'social_tags',
      status: 'warning',
      message: `Partial Open Graph implementation (${ogTagsCount}/3 basic tags found)`,
      url
    })
    technicalScore -= 2
  } else {
    technicalFindings.push({
      type: 'social_tags',
      status: 'good',
      message: 'Complete Open Graph tags found (title, description, image)',
      url
    })
  }
  
  // Check for canonical URL
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
  if (!canonicalMatch) {
    technicalFindings.push({
      type: 'canonical',
      status: 'warning',
      message: 'No canonical URL found',
      url
    })
    technicalScore -= 2
  } else {
    technicalFindings.push({
      type: 'canonical',
      status: 'good',
      message: `Canonical URL found: ${canonicalMatch[1]}`,
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
      imagesWithEmptyAlt: imgsWithEmptyAlt,
      hasStructuredData: !!(jsonLdMatches || microdataMatches.length > 0),
      structuredDataTypes: {
        jsonLd: jsonLdMatches ? jsonLdMatches.length : 0,
        microdata: microdataMatches.length
      },
      titleLength: titleMatch ? titleMatch[1].trim().length : 0,
      metaDescriptionLength: metaDescMatch ? metaDescMatch[1].trim().length : 0,
      h1Count: h1Matches ? h1Matches.length : 0,
      headingCounts: {
        h1: h1Matches ? h1Matches.length : 0,
        h2: h2Matches.length,
        h3: h3Matches.length,
        h4: h4Matches.length
      },
      openGraphTags: ogTagsCount,
      hasCanonical: !!canonicalMatch,
      hasViewportMeta: !!metaViewportMatch,
      hasCharsetMeta: !!metaCharsetMatch
    }
  }
}
