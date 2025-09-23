// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore -- Deno URL import
import "https://deno.land/x/xhr@0.1.0/mod.ts"

// Provide ambient Deno type for local TS tooling
declare const Deno: any;

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
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }

    // Use the improved analyzeDomain function
    const result = await analyzeDomain(domain, user_id, { supabaseUrl, supabaseKey })
    
    if (!result.success) {
      throw new Error(result.error)
    }

    // Fetch the complete analysis with findings for response
    const completeAnalysisResponse = await fetch(
      `${supabaseUrl}/rest/v1/seo_analyses?id=eq.${result.analysisId}&select=*,technical_findings(*)`,
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

async function analyzeDomain(domain, user_id, supabaseConfig) {
  try {
    // Clean the domain (remove http/https if present)
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '')
    const fullUrl = `https://${cleanDomain}`
    
    console.log('Running parallel analyses for:', fullUrl)
    
    // Run all analyses in parallel for better performance
    const [metaResults, speedResults, backlinkResults] = await Promise.all([
      checkMetaTags(fullUrl),
      checkPageSpeed(fullUrl),
      checkBacklinks(cleanDomain)
    ])
    
    console.log('All analyses completed')
    
    // Calculate weighted scores
    const scores = calculateSEOScore(metaResults.findings, backlinkResults, speedResults)
    console.log('SEO scores calculated:', scores)
    
    // Prepare analysis data
    const analysisData = {
      ...metaResults.analysisData,
      performance: speedResults,
      backlinks: backlinkResults
    }
    
    // Generate cache key from analysis data
    const cacheKey = await generateCacheKey(analysisData, scores)
    console.log('Generated cache key:', cacheKey)
    
    // Check if dashboard already exists for this cache key
    const existingDashboard = await checkExistingDashboard(cacheKey, supabaseConfig)
    let dashboardContent = null
    
    if (existingDashboard) {
      console.log('Using cached dashboard')
      dashboardContent = existingDashboard.dashboard_content
    } else {
      console.log('Generating new dashboard with OpenAI')
      // Generate dashboard using OpenAI
      const allFindings = [
        ...metaResults.findings,
        ...speedResults.findings,
        ...backlinkResults.findings
      ]
      
      dashboardContent = await generateSEODashboard({
        domain: cleanDomain,
        scores,
        analysisData,
        findings: allFindings
      })
    }
    
    // Store analysis in Supabase
    const analysisResponse = await fetch(`${supabaseConfig.supabaseUrl}/rest/v1/seo_analyses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseConfig.supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseConfig.supabaseKey,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id,
        domain: cleanDomain,
        technical_score: scores.technical,
        backlink_score: scores.backlinks,
        performance_score: scores.speed,
        total_score: scores.total,
        analysis_data: analysisData,
        dashboard_content: dashboardContent,
        dashboard_generated_at: new Date().toISOString(),
        cache_key: cacheKey,
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
    
    // Combine all findings
    const allFindings = [
      ...metaResults.findings,
      ...speedResults.findings,
      ...backlinkResults.findings
    ]
    
    // Store technical findings
    if (allFindings.length > 0) {
      const findingsResponse = await fetch(`${supabaseConfig.supabaseUrl}/rest/v1/technical_findings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseConfig.supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.supabaseKey,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(
          allFindings.map(finding => ({
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
    
    return {
      success: true,
      scores: scores,
      findings: allFindings,
      analysisId: analysisId
    }
    
  } catch (error) {
    console.error('Analysis failed:', error)
    return { success: false, error: error.message }
  }
}

async function checkMetaTags(url) {
  try {
    console.log('Checking meta tags for:', url)
    
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0)'
      }
    })
    
    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status} ${pageResponse.statusText}`)
    }
    
    const pageContent = await pageResponse.text()
    console.log('Page content fetched, length:', pageContent.length)
    
    return performEnhancedSEOAnalysis(pageContent, url)
    
  } catch (error) {
    console.error('Meta tags check error:', error)
    return {
      findings: [{
        type: 'meta_tags',
        status: 'error',
        message: `Could not check meta tags: ${error.message}`,
        url
      }],
      analysisData: {}
    }
  }
}

async function checkBacklinks(domain: string) {
  try {
    const ahrefsToken = Deno.env.get('AHREFS_API_KEY')
    const mozApiKey = Deno.env.get('MOZ_API_KEY')
    const mozSecretKey = Deno.env.get('MOZ_SECRET_KEY')
    
    // Prefer Ahrefs if configured
    if (ahrefsToken) {
      try {
        const ahrefsUrl = `https://apiv2.ahrefs.com?from=domain_rating&target=${encodeURIComponent(domain)}&mode=domain&output=json&token=${encodeURIComponent(ahrefsToken)}`
        const res = await fetch(ahrefsUrl)
        if (!res.ok) {
          throw new Error(`Ahrefs API error: ${res.status}`)
        }
        const data = await res.json()
        // Try to extract DR from common shapes
        const dr = (
          (Array.isArray(data?.domain_rating) && data.domain_rating[0]?.domain_rating) ??
          data?.metrics?.domain_rating ??
          data?.domain_rating ?? 0
        )
        const domainAuthority = Math.round(Number(dr) || 0)
        return {
          domain_authority: domainAuthority,
          findings: [{
            type: 'backlinks',
            status: domainAuthority > 50 ? 'good' : domainAuthority > 20 ? 'warning' : 'error',
            message: `Ahrefs Domain Rating (DR): ${domainAuthority}/100`,
            url: `https://${domain}`
          }]
        }
      } catch (err) {
        console.warn('Ahrefs check failed, falling back:', err)
        // Fall through to Moz/simulation handling below
      }
    }
    
    if (!mozApiKey || !mozSecretKey) {
      const allowSim = Deno.env.get('ALLOW_SIMULATION') === 'true'
      if (allowSim) {
        console.warn('Moz API keys not found, simulation enabled (ALLOW_SIMULATION=true)')
        const simulatedScore = Math.floor(Math.random() * 40) + 10
        return {
          domain_authority: simulatedScore,
          findings: [{
            type: 'backlinks',
            status: simulatedScore > 30 ? 'good' : simulatedScore > 15 ? 'warning' : 'error',
            message: `Estimated Domain Authority: ${simulatedScore}/100 (simulation)`,
            url: `https://${domain}`
          }]
        }
      }
      // No simulation in production: return unavailable state
      return {
        domain_authority: 0,
        findings: [{
          type: 'backlinks',
          status: 'error',
          message: 'Backlink data unavailable. Configure MOZ_API_KEY and MOZ_SECRET_KEY.',
          url: `https://${domain}`
        }]
      }
    }
    
    console.log('Checking backlinks for domain:', domain)
    
    // Create authentication header for Moz API
    const timestamp = Math.floor(Date.now() / 1000)
    const stringToSign = `${mozApiKey}\n${timestamp}`
    
    // Note: In a real implementation, you'd need to properly sign the request
    // For now, we'll provide a fallback implementation
    const response = await fetch(`https://lsapi.seomoz.com/v2/url_metrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(mozApiKey + ':' + mozSecretKey)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targets: [`https://${domain}`]
      })
    })
    
    if (!response.ok) {
      throw new Error(`Moz API error: ${response.status}`)
    }
    
    const data = await response.json()
    const domainAuthority = data.results?.[0]?.domain_authority || 0
    
    return {
      domain_authority: domainAuthority,
      findings: [{
        type: 'backlinks',
        status: domainAuthority > 50 ? 'good' : domainAuthority > 20 ? 'warning' : 'error',
        message: `Domain Authority: ${domainAuthority}/100`,
        url: `https://${domain}`
      }]
    }
    
  } catch (error) {
    console.error('Backlink check error:', error)
    const allowSim = Deno.env.get('ALLOW_SIMULATION') === 'true'
    if (allowSim) {
      const fallbackScore = Math.floor(Math.random() * 30) + 5
      return { 
        domain_authority: fallbackScore, 
        findings: [{
          type: 'backlinks',
          status: 'warning',
          message: `Backlink check failed. Using simulated DA: ${fallbackScore}/100`,
          url: `https://${domain}`
        }]
      }
    }
    return { 
      domain_authority: 0, 
      findings: [{
        type: 'backlinks',
        status: 'error',
        message: 'Backlink check failed and simulation is disabled. Ensure MOZ API is configured.',
        url: `https://${domain}`
      }]
    }
  }
}

async function checkPageSpeed(url: string) {
  try {
    const googleApiKey = Deno.env.get('GOOGLE_API_KEY')
    
    if (!googleApiKey) {
      console.warn('Google API key not found, skipping PageSpeed analysis')
      return {
        score: 50, // Default neutral score
        findings: [{
          type: 'performance',
          status: 'warning',
          message: 'PageSpeed analysis unavailable - Google API key not configured',
          url
        }]
      }
    }
    
    console.log('Checking page speed for:', url)
    
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${googleApiKey}&category=PERFORMANCE`
    )
    
    if (!response.ok) {
      throw new Error(`PageSpeed API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.lighthouseResult?.categories?.performance) {
      throw new Error('Invalid PageSpeed API response')
    }
    
    const score = Math.round(data.lighthouseResult.categories.performance.score * 100)
    
    // Get additional performance metrics
    const audits = data.lighthouseResult.audits
    const findings = [{
      type: 'performance',
      status: score > 90 ? 'good' : score > 50 ? 'warning' : 'error',
      message: `PageSpeed score: ${score}/100`,
      url
    }]
    
    // Add specific performance findings
    if (audits['first-contentful-paint']) {
      const fcp = audits['first-contentful-paint'].displayValue
      findings.push({
        type: 'performance',
        status: audits['first-contentful-paint'].score > 0.9 ? 'good' : audits['first-contentful-paint'].score > 0.5 ? 'warning' : 'error',
        message: `First Contentful Paint: ${fcp}`,
        url
      })
    }
    
    if (audits['largest-contentful-paint']) {
      const lcp = audits['largest-contentful-paint'].displayValue
      findings.push({
        type: 'performance',
        status: audits['largest-contentful-paint'].score > 0.9 ? 'good' : audits['largest-contentful-paint'].score > 0.5 ? 'warning' : 'error',
        message: `Largest Contentful Paint: ${lcp}`,
        url
      })
    }
    
    return { score, findings }
    
  } catch (error) {
    console.error('PageSpeed check error:', error)
    return { 
      score: 0, 
      findings: [{
        type: 'performance',
        status: 'error',
        message: `Could not check page speed: ${error.message}`,
        url
      }]
    }
  }
}

function performEnhancedSEOAnalysis(html: string, url: string) {
  const technicalFindings: Array<{ type: string; status: 'good' | 'warning' | 'error' | 'info'; message: string; url: string }> = []
  let technicalScore = 100
  const backlinkScore = 50 // Default since we can't check backlinks easily
  
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
    const structuredDataTypes: string[] = []
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
  
  return {
    technicalScore,
    backlinkScore,
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
    },
    findings: technicalFindings
  }
}

// Generate cache key from analysis data using a simple hash
async function generateCacheKey(analysisData, scores) {
  const dataString = JSON.stringify({ analysisData, scores })
  const encoder = new TextEncoder()
  const data = encoder.encode(dataString)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex.substring(0, 16) // Use first 16 characters
}

// Check if dashboard already exists for cache key
async function checkExistingDashboard(cacheKey, supabaseConfig) {
  try {
    const response = await fetch(
      `${supabaseConfig.supabaseUrl}/rest/v1/seo_analyses?cache_key=eq.${cacheKey}&select=dashboard_content&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseConfig.supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseConfig.supabaseKey,
        },
      }
    )
    
    if (!response.ok) {
      console.warn('Failed to check existing dashboard')
      return null
    }
    
    const data = await response.json()
    return data.length > 0 && data[0].dashboard_content ? data[0] : null
  } catch (error) {
    console.warn('Error checking existing dashboard:', error)
    return null
  }
}

// Generate SEO Dashboard using OpenAI
async function generateSEODashboard(analysisResult) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    console.warn('OpenAI API key not found, skipping dashboard generation')
    return null
  }

  try {
    const prompt = `As an expert SEO analyst, transform the following raw SEO analysis data into a detailed, well-structured dashboard. Format it in Markdown for a website owner who may not be an SEO expert.

**Raw SEO Data:**
${JSON.stringify(analysisResult, null, 2)}

**Structure your response exactly as follows:**

# 🔍 SEO Analysis Dashboard for ${analysisResult.domain}

## 📊 Overall SEO Health Score

| Metric | Score | Rating |
|--------|-------|--------|
| **Total Score** | ${analysisResult.scores.total}/100 | ${getScoreEmoji(analysisResult.scores.total)} ${getScoreRating(analysisResult.scores.total)} |
| **Technical SEO** | ${analysisResult.scores.technical}/40 | ${getScoreEmoji(analysisResult.scores.technical * 2.5)} ${getScoreRating(analysisResult.scores.technical * 2.5)} |
| **Performance** | ${analysisResult.scores.speed}/30 | ${getScoreEmoji(analysisResult.scores.speed * 3.33)} ${getScoreRating(analysisResult.scores.speed * 3.33)} |
| **Backlinks** | ${analysisResult.scores.backlinks}/30 | ${getScoreEmoji(analysisResult.scores.backlinks * 3.33)} ${getScoreRating(analysisResult.scores.backlinks * 3.33)} |

## 🎯 Key Metrics at a Glance

| Metric | Value | Status |
|--------|-------|---------|
| **Domain Authority** | ${analysisResult.analysisData?.backlinks?.domain_authority || 'N/A'}/100 | ${getDAEmoji(analysisResult.analysisData?.backlinks?.domain_authority)} |
| **PageSpeed Score** | ${analysisResult.analysisData?.performance?.score || 'N/A'}/100 | ${getSpeedEmoji(analysisResult.analysisData?.performance?.score)} |
| **Page Size** | ${formatBytes(analysisResult.analysisData?.pageSize || 0)} | ${getSizeEmoji(analysisResult.analysisData?.pageSize)} |
| **Images** | ${analysisResult.analysisData?.imageCount || 0} total | ${getImageEmoji(analysisResult.analysisData?.imagesWithoutAlt, analysisResult.analysisData?.imageCount)} |

## 🔧 On-Page SEO Analysis

| Finding | Status | Details |
|---------|---------|---------|
| **Title Tag** | ${getTitleStatus(analysisResult.analysisData?.titleLength)} | Length: ${analysisResult.analysisData?.titleLength || 0} characters |
| **Meta Description** | ${getMetaStatus(analysisResult.analysisData?.metaDescriptionLength)} | Length: ${analysisResult.analysisData?.metaDescriptionLength || 0} characters |
| **Heading Structure** | ${getHeadingStatus(analysisResult.analysisData?.h1Count)} | H1: ${analysisResult.analysisData?.headingCounts?.h1 || 0}, H2: ${analysisResult.analysisData?.headingCounts?.h2 || 0} |
| **Images SEO** | ${getImageSEOStatus(analysisResult.analysisData?.imagesWithoutAlt)} | ${analysisResult.analysisData?.imagesWithoutAlt || 0} missing alt tags |
| **Structured Data** | ${getStructuredDataStatus(analysisResult.analysisData?.hasStructuredData)} | ${analysisResult.analysisData?.hasStructuredData ? 'Present' : 'Missing'} |
| **Open Graph** | ${getOGStatus(analysisResult.analysisData?.openGraphTags)} | ${analysisResult.analysisData?.openGraphTags || 0}/3 tags found |

## ⚡ Performance & Speed Analysis

| Metric | Value | Status | Priority |
|--------|-------|---------|----------|
| **Overall Speed** | ${analysisResult.analysisData?.performance?.score || 'N/A'}/100 | ${getSpeedEmoji(analysisResult.analysisData?.performance?.score)} | ${getSpeedPriority(analysisResult.analysisData?.performance?.score)} |
| **Page Size** | ${formatBytes(analysisResult.analysisData?.pageSize || 0)} | ${getSizeEmoji(analysisResult.analysisData?.pageSize)} | ${getSizePriority(analysisResult.analysisData?.pageSize)} |

## 🔗 Off-Page SEO: Backlinks & Authority

| Metric | Value | Status | Impact |
|--------|-------|---------|---------|
| **Domain Authority** | ${analysisResult.analysisData?.backlinks?.domain_authority || 'N/A'}/100 | ${getDAEmoji(analysisResult.analysisData?.backlinks?.domain_authority)} | ${getDAImpact(analysisResult.analysisData?.backlinks?.domain_authority)} |

## 🎯 High-Priority Action Plan

${generateActionPlan(analysisResult)}

---
*Analysis completed on ${new Date().toLocaleDateString()}*

Please provide the complete markdown dashboard following this exact structure. Use emojis, tables, and clear formatting for easy reading.`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO analyst who creates beautiful, easy-to-read dashboards from raw data. Always format in clean Markdown with proper tables and emojis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1600
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const dashboardContent = data.choices[0].message.content

    console.log('Dashboard generated successfully')
    return dashboardContent

  } catch (error) {
    console.error('Dashboard generation error:', error)
    return null
  }
}

// Helper functions for dashboard generation
function getScoreEmoji(score) {
  if (score >= 80) return '🟢'
  if (score >= 60) return '🟡'
  return '🔴'
}

function getScoreRating(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Improvement'
  return 'Poor'
}

function getDAEmoji(da) {
  if (!da) return '⚪'
  if (da >= 50) return '🟢'
  if (da >= 20) return '🟡'
  return '🔴'
}

function getSpeedEmoji(speed) {
  if (!speed) return '⚪'
  if (speed >= 90) return '🟢'
  if (speed >= 50) return '🟡'
  return '🔴'
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getSizeEmoji(size) {
  if (!size) return '⚪'
  if (size < 500000) return '🟢' // < 500KB
  if (size < 2000000) return '🟡' // < 2MB
  return '🔴' // > 2MB
}

function getImageEmoji(missingAlt, total) {
  if (!total) return '⚪'
  if (missingAlt === 0) return '🟢'
  if (missingAlt < total / 2) return '🟡'
  return '🔴'
}

function getTitleStatus(length) {
  if (!length) return '🔴 Missing'
  if (length >= 30 && length <= 60) return '🟢 Optimal'
  return '🟡 Needs Work'
}

function getMetaStatus(length) {
  if (!length) return '🔴 Missing'
  if (length >= 120 && length <= 160) return '🟢 Optimal'
  return '🟡 Needs Work'
}

function getHeadingStatus(h1Count) {
  if (h1Count === 1) return '🟢 Good'
  if (h1Count === 0) return '🔴 Missing H1'
  return '🟡 Multiple H1s'
}

function getImageSEOStatus(missingAlt) {
  if (missingAlt === 0) return '🟢 Good'
  if (missingAlt > 0) return '🔴 Issues Found'
  return '⚪ No Images'
}

function getStructuredDataStatus(hasData) {
  return hasData ? '🟢 Present' : '🔴 Missing'
}

function getOGStatus(count) {
  if (count >= 3) return '🟢 Complete'
  if (count > 0) return '🟡 Partial'
  return '🔴 Missing'
}

function getSpeedPriority(speed) {
  if (!speed || speed < 50) return '🔥 High Priority'
  if (speed < 80) return '🟡 Medium Priority'
  return '✅ Low Priority'
}

function getSizePriority(size) {
  if (!size) return '⚪ Unknown'
  if (size > 2000000) return '🔥 High Priority'
  if (size > 1000000) return '🟡 Medium Priority'
  return '✅ Low Priority'
}

function getDAImpact(da) {
  if (!da) return 'Unknown'
  if (da < 20) return 'Critical - Build Authority'
  if (da < 40) return 'Important - Grow Links'
  return 'Good Foundation'
}

function generateActionPlan(analysisResult) {
  const actions: string[] = []
  
  // Check performance issues
  if (analysisResult.analysisData?.performance?.score < 50) {
    actions.push('1. **Improve Page Speed** - Current score is below 50/100. Optimize images, enable compression, and minimize CSS/JS.')
  }
  
  // Check technical SEO issues
  if (!analysisResult.analysisData?.titleLength || analysisResult.analysisData.titleLength < 30) {
    actions.push('2. **Optimize Title Tags** - Create compelling, keyword-rich titles between 30-60 characters.')
  }
  
  // Check DA issues
  if (analysisResult.analysisData?.backlinks?.domain_authority < 20) {
    actions.push('3. **Build Backlink Strategy** - Low domain authority detected. Focus on earning quality backlinks from reputable sources.')
  }
  
  // Check meta description
  if (!analysisResult.analysisData?.metaDescriptionLength || analysisResult.analysisData.metaDescriptionLength < 120) {
    actions.push('4. **Write Better Meta Descriptions** - Create compelling descriptions between 120-160 characters to improve click-through rates.')
  }
  
  if (actions.length === 0) {
    actions.push('🎉 **Great job!** Your website has strong SEO fundamentals. Continue monitoring and improving content quality.')
  }
  
  return actions.join('\n\n')
}

function calculateSEOScore(technicalFindings, backlinkData, pageSpeedData) {
  let totalScore = 0;
  const maxScore = 100;
  
  // Technical SEO scoring (40% of total)
  let technicalScore = 40;
  technicalFindings.forEach(finding => {
    if (finding.status === 'error') technicalScore -= 10;
    if (finding.status === 'warning') technicalScore -= 5;
  });
  technicalScore = Math.max(0, technicalScore);
  
  // Page Speed scoring (30% of total)
  const speedScore = (pageSpeedData && pageSpeedData.score ? pageSpeedData.score : 0) / 100 * 30;
  
  // Backlink scoring (30% of total)
  const backlinkDA = typeof backlinkData?.domain_authority === 'number' ? backlinkData.domain_authority : 0;
  const backlinkScore = (backlinkDA / 100) * 30;
  
  totalScore = technicalScore + speedScore + backlinkScore;
  
  return {
    total: Math.round(totalScore),
    technical: Math.round(technicalScore),
    speed: Math.round(speedScore),
    backlinks: Math.round(backlinkScore)
  };
}
