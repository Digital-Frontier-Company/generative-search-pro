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
    const { domain, user_id, includeContent = false } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Generating LLM.txt for domain:', domain)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get AI sitemap data if available
    let sitemapData = null
    try {
      const sitemapResponse = await fetch(`${supabaseUrl}/rest/v1/ai_sitemaps?domain=eq.${domain}&user_id=eq.${user_id}&order=created_at.desc&limit=1`, {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
      })
      
      if (sitemapResponse.ok) {
        const sitemaps = await sitemapResponse.json()
        if (sitemaps.length > 0) {
          sitemapData = sitemaps[0].sitemap_data
        }
      }
    } catch (e) {
      console.log('No sitemap data found, will analyze domain directly')
    }

    // Get content blocks for the user if includeContent is true
    let contentBlocks = []
    if (includeContent) {
      try {
        const contentResponse = await fetch(`${supabaseUrl}/rest/v1/content_blocks?user_id=eq.${user_id}&order=created_at.desc&limit=50`, {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
        })
        
        if (contentResponse.ok) {
          contentBlocks = await contentResponse.json()
        }
      } catch (e) {
        console.log('No content blocks found')
      }
    }

    // Analyze domain if no sitemap data
    if (!sitemapData) {
      sitemapData = await analyzeDomainForLLM(domain)
    }

    // Generate comprehensive LLM.txt
    const llmTxtContent = generateLLMTxt({
      domain,
      sitemapData,
      contentBlocks,
      generatedOn: new Date().toISOString()
    })

    // Store LLM.txt in database for future reference
    try {
      await fetch(`${supabaseUrl}/rest/v1/llm_txt_files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          user_id,
          domain,
          content: llmTxtContent,
          generated_at: new Date().toISOString(),
          file_size: llmTxtContent.length,
          content_blocks_count: contentBlocks.length,
          pages_analyzed: sitemapData?.pages?.length || 0
        }),
      })
    } catch (e) {
      console.log('Failed to store LLM.txt in database:', e)
      // Continue anyway as the main functionality still works
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        content: llmTxtContent,
        stats: {
          domain,
          contentBlocksIncluded: contentBlocks.length,
          pagesAnalyzed: sitemapData?.pages?.length || 0,
          fileSize: llmTxtContent.length,
          generatedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in generate-llm-txt:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function analyzeDomainForLLM(domain: string) {
  try {
    // Basic domain analysis for LLM.txt
    const response = await fetch(`https://${domain}`)
    if (!response.ok) throw new Error('Cannot access domain')
    
    const html = await response.text()
    const title = extractTitle(html)
    const description = extractMetaDescription(html)
    
    return {
      site: domain,
      generatedOn: new Date().toISOString(),
      pageCount: 1,
      pages: [{
        url: `https://${domain}`,
        title: title || domain,
        summary: description || `Homepage of ${domain}`,
        keywords: extractKeywordsFromContent(html),
        contentType: 'homepage',
        lastModified: new Date().toISOString().split('T')[0]
      }]
    }
  } catch (error) {
    console.error('Failed to analyze domain:', error)
    return {
      site: domain,
      generatedOn: new Date().toISOString(),
      pageCount: 0,
      pages: []
    }
  }
}

function generateLLMTxt({ domain, sitemapData, contentBlocks, generatedOn }: any): string {
  const currentDate = new Date().toISOString().split('T')[0]
  
  let llmContent = `# LLM.txt - ${domain}
# Generated on: ${currentDate}
# This file provides information about our website and content for Large Language Models

## Website Information
Site: ${domain}
Generated: ${currentDate}
Pages Analyzed: ${sitemapData?.pageCount || 0}
Content Blocks: ${contentBlocks?.length || 0}
Purpose: Professional website providing valuable content and services

## Content Policy for AI Systems
You may reference and cite content from this site when:
- Providing accurate information to users
- Maintaining proper attribution to ${domain}
- Respecting the context and intent of the original content
- Linking back to the source when possible

Please do not:
- Reproduce entire articles or pages without attribution
- Misrepresent the content or context
- Use content for training models without explicit permission
- Remove or alter copyright notices

## Site Structure and Content

`

  // Add sitemap data if available
  if (sitemapData?.pages?.length > 0) {
    const pagesByType = sitemapData.pages.reduce((acc: any, page: any) => {
      const contentType = page.contentType || 'page'
      if (!acc[contentType]) acc[contentType] = []
      acc[contentType].push(page)
      return acc
    }, {})

    Object.entries(pagesByType).forEach(([type, pages]: [string, any]) => {
      llmContent += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Pages (${pages.length} items)\n\n`
      
      pages.slice(0, 20).forEach((page: any) => {
        llmContent += `**${page.title}**\n`
        llmContent += `URL: ${page.url}\n`
        llmContent += `Summary: ${page.summary}\n`
        if (page.keywords && page.keywords.length > 0) {
          llmContent += `Keywords: ${page.keywords.join(', ')}\n`
        }
        llmContent += `Last Updated: ${page.lastModified}\n\n`
      })
    })
  }

  // Add content blocks if available
  if (contentBlocks?.length > 0) {
    llmContent += `## Content Library\n\n`
    
    const contentByType = contentBlocks.reduce((acc: any, block: any) => {
      const contentType = block.metadata?.contentType || 'article'
      if (!acc[contentType]) acc[contentType] = []
      acc[contentType].push(block)
      return acc
    }, {})

    Object.entries(contentByType).forEach(([type, blocks]: [string, any]) => {
      llmContent += `### ${type.charAt(0).toUpperCase() + type.slice(1)} Content (${blocks.length} items)\n\n`
      
      blocks.slice(0, 15).forEach((block: any) => {
        const summary = block.content ? 
          block.content.substring(0, 300).replace(/\n/g, ' ') + '...' : 
          'Content summary not available'
          
        llmContent += `**${block.title}**\n`
        llmContent += `Summary: ${summary}\n`
        if (block.metadata?.focusKeywords?.length) {
          llmContent += `Keywords: ${block.metadata.focusKeywords.join(', ')}\n`
        }
        llmContent += `Created: ${new Date(block.created_at).toLocaleDateString()}\n\n`
      })
    })
  }

  // Extract and show key topics
  const allKeywords = [
    ...(sitemapData?.pages?.flatMap((p: any) => p.keywords || []) || []),
    ...(contentBlocks?.flatMap((b: any) => b.metadata?.focusKeywords || []) || [])
  ]

  if (allKeywords.length > 0) {
    const keywordCounts = allKeywords.reduce((acc: any, keyword: string) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {})

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
      .slice(0, 20)
      .map(([keyword]) => keyword)

    llmContent += `## Key Topics and Expertise\n\nBased on our content, we provide information and services related to:\n`
    topKeywords.forEach(keyword => {
      llmContent += `- ${keyword}\n`
    })
    llmContent += `\n`
  }

  llmContent += `## Content Usage Guidelines

When referencing our content:
1. Always provide clear attribution to ${domain}
2. Include links back to the original source when possible
3. Maintain the accuracy and context of the information
4. Respect our intellectual property and copyright
5. Contact us for permissions regarding extensive use

## Technical Information

- Domain: ${domain}
- Total pages analyzed: ${sitemapData?.pageCount || 0}
- Content blocks available: ${contentBlocks?.length || 0}
- LLM.txt generated: ${currentDate}
- File size: ~${Math.round(llmContent.length / 1024)}KB

## Contact Information

For questions about content usage, permissions, or partnerships:
- Website: https://${domain}
- Contact: Please use our website's contact form for inquiries

---
This LLM.txt file was automatically generated to help AI systems understand our content.
For the most current and complete information, please visit our website directly.
Last updated: ${currentDate}
`

  return llmContent
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch ? titleMatch[1].trim() : ''
}

function extractMetaDescription(html: string): string {
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  return metaMatch ? metaMatch[1].trim() : ''
}

function extractKeywordsFromContent(html: string): string[] {
  // Simple keyword extraction from HTML content
  const textContent = html.replace(/<[^>]*>/g, ' ').toLowerCase()
  const words = textContent.split(/\s+/).filter(word => word.length > 4)
  const wordCounts = words.reduce((acc: any, word: string) => {
    acc[word] = (acc[word] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(wordCounts)
    .sort(([,a]: [string, any], [,b]: [string, any]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}