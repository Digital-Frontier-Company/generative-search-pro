
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
    const { domain, user_id } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Generating AI sitemap for domain:', domain)
    
    // First, try to fetch existing sitemap
    const sitemapUrls = [`${domain}/sitemap.xml`, `${domain}/sitemap_index.xml`]
    let discoveredPages = []
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapResponse = await fetch(sitemapUrl)
        if (sitemapResponse.ok) {
          const sitemapContent = await sitemapResponse.text()
          const urls = extractUrlsFromSitemap(sitemapContent)
          discoveredPages = [...discoveredPages, ...urls]
          break
        }
      } catch (e) {
        console.log(`Failed to fetch sitemap from ${sitemapUrl}:`, e)
      }
    }
    
    // If no sitemap found, crawl key pages
    if (discoveredPages.length === 0) {
      discoveredPages = await crawlKeyPages(domain)
    }
    
    // Limit to first 20 pages for processing
    const pagesToProcess = discoveredPages.slice(0, 20)
    
    // Generate AI-optimized page summaries
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    const aiSitemapPages = []
    
    for (const pageUrl of pagesToProcess) {
      try {
        const pageResponse = await fetch(pageUrl)
        if (!pageResponse.ok) continue
        
        const pageContent = await pageResponse.text()
        const title = extractTitle(pageContent)
        const sanitizeHtml = require("sanitize-html");
        const excerpt = sanitizeHtml(pageContent).substring(0, 1000)
        
        // Generate AI summary and keywords
        const summaryPrompt = `
        Analyze this webpage and create an AI-optimized summary:
        
        URL: ${pageUrl}
        Title: ${title}
        Content: ${excerpt}
        
        Return a JSON object with:
        - summary: Brief 1-2 sentence description of page content
        - keywords: Array of 3-5 relevant keywords
        - contentType: Type of content (article, product, service, faq, etc.)
        - lastModified: Estimated date (use current date if unknown)
        `
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: summaryPrompt }],
            temperature: 0.3,
          }),
        })
        
        const openaiData = await openaiResponse.json()
        let pageData
        
        try {
          pageData = JSON.parse(openaiData.choices[0].message.content)
        } catch (e) {
          pageData = {
            summary: `Page content from ${title}`,
            keywords: ['general'],
            contentType: 'page',
            lastModified: new Date().toISOString().split('T')[0]
          }
        }
        
        aiSitemapPages.push({
          url: pageUrl,
          title: title,
          summary: pageData.summary,
          keywords: pageData.keywords,
          contentType: pageData.contentType,
          lastModified: pageData.lastModified
        })
        
      } catch (e) {
        console.log(`Failed to process page ${pageUrl}:`, e)
      }
    }
    
    // Create AI sitemap structure
    const aiSitemap = {
      site: domain,
      generatedOn: new Date().toISOString(),
      aiPolicy: `${domain}/ai-policy.json`,
      pageCount: aiSitemapPages.length,
      pages: aiSitemapPages
    }
    
    // Store in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/ai_sitemaps`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id,
        domain,
        sitemap_data: aiSitemap,
        page_count: aiSitemapPages.length
      }),
    })
    
    return new Response(
      JSON.stringify({
        success: true,
        sitemap: aiSitemap
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in generate-ai-sitemap:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractUrlsFromSitemap(sitemapXml: string): string[] {
  const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || []
  return urlMatches.map(match => match.replace(/<\/?loc>/g, ''))
}

async function crawlKeyPages(domain: string): Promise<string[]> {
  const commonPaths = ['', '/about', '/services', '/products', '/blog', '/contact', '/faq']
  const pages = []
  
  for (const path of commonPaths) {
    try {
      const url = `${domain}${path}`
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        pages.push(url)
      }
    } catch (e) {
      console.log(`Failed to check ${domain}${path}`)
    }
  }
  
  return pages
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : 'Untitled Page'
}
