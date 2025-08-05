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
    const { domain, user_id, comprehensive = false } = await req.json()
    
    if (!domain || !user_id) {
      throw new Error('Domain and user_id are required')
    }

    console.log('Analyzing technical AI readiness for domain:', domain)
    
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const fullUrl = `https://${cleanDomain}`;
    
    // Perform comprehensive technical analysis
    const analysis = await performTechnicalAIAnalysis(fullUrl, cleanDomain, comprehensive);
    
    // Store results in database
    await storeTechnicalAnalysis({
      user_id,
      domain: cleanDomain,
      analysis,
      comprehensive
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in analyze-technical-ai-readiness:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function performTechnicalAIAnalysis(url: string, domain: string, comprehensive: boolean) {
  // Fetch page content for analysis
  let html = '';
  let fetchError = false;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIReadinessBot/1.0; +https://example.com/bot)'
      }
    });
    
    if (response.ok) {
      html = await response.text();
    } else {
      fetchError = true;
    }
  } catch (error) {
    console.error('Failed to fetch page:', error);
    fetchError = true;
  }

  const categories = {
    serverSideRendering: analyzeServerSideRendering(html, url),
    semanticHTML: analyzeSemanticHTML(html),
    pageSpeed: await analyzePageSpeed(url),
    mobileOptimization: analyzeMobileOptimization(html),
    aiCrawlerAccess: await analyzeAICrawlerAccess(url, domain)
  };

  // Calculate overall score
  const overallScore = Math.round(
    Object.values(categories).reduce((sum, category) => sum + category.score, 0) / 5
  );

  // Generate priority actions
  const priorityActions = generatePriorityActions(categories);

  return {
    overallScore,
    categories,
    priorityActions,
    lastAnalyzed: new Date().toISOString(),
    fetchError
  };
}

function analyzeServerSideRendering(html: string, url: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  if (!html) {
    return {
      score: 0,
      status: 'critical' as const,
      findings: ['Unable to fetch page content'],
      recommendations: ['Ensure the website is accessible and responds to HTTP requests']
    };
  }

  // Check if content is present in HTML source
  const hasMainContent = html.length > 1000;
  if (hasMainContent) {
    score += 25;
    findings.push('Page content is present in HTML source');
  } else {
    recommendations.push('Ensure main content is rendered server-side for AI crawler accessibility');
  }

  // Check for JavaScript-dependent content indicators
  const hasJSPlaceholders = /loading|skeleton|spinner|<div[^>]*id=["']root["']/i.test(html);
  if (!hasJSPlaceholders) {
    score += 25;
    findings.push('No client-side rendering placeholders detected');
  } else {
    recommendations.push('Minimize client-side rendering for critical content');
  }

  // Check for proper meta tags in source
  const hasMetaTags = /<title[^>]*>/.test(html) && /<meta[^>]*name=["']description["']/.test(html);
  if (hasMetaTags) {
    score += 25;
    findings.push('Meta tags are present in HTML source');
  } else {
    recommendations.push('Ensure title and meta description are server-side rendered');
  }

  // Check for structured data in source
  const hasStructuredData = /application\/ld\+json/.test(html) || /itemscope|itemtype/.test(html);
  if (hasStructuredData) {
    score += 25;
    findings.push('Structured data is present in HTML source');
  } else {
    recommendations.push('Add JSON-LD structured data for better AI understanding');
  }

  const status = score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'needs_improvement' : 'critical';

  return { score, status, findings, recommendations };
}

function analyzeSemanticHTML(html: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  if (!html) {
    return {
      score: 0,
      status: 'critical' as const,
      findings: ['Unable to analyze HTML structure'],
      recommendations: ['Ensure the website is accessible for analysis']
    };
  }

  // Check for semantic HTML5 elements
  const semanticElements = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
  const foundElements = semanticElements.filter(element => 
    new RegExp(`<${element}[^>]*>`, 'i').test(html)
  );
  
  if (foundElements.length >= 4) {
    score += 30;
    findings.push(`Found ${foundElements.length} semantic HTML5 elements: ${foundElements.join(', ')}`);
  } else {
    recommendations.push('Use semantic HTML5 elements (header, nav, main, article, section, footer)');
  }

  // Check heading hierarchy
  const headings = html.match(/<h[1-6][^>]*>/gi) || [];
  const hasH1 = /<h1[^>]*>/i.test(html);
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  
  if (hasH1 && h1Count === 1) {
    score += 20;
    findings.push('Proper H1 usage (single H1 tag found)');
  } else if (h1Count > 1) {
    recommendations.push('Use only one H1 tag per page');
  } else {
    recommendations.push('Add an H1 tag for the main page heading');
  }

  if (headings.length >= 3) {
    score += 15;
    findings.push(`Good heading structure with ${headings.length} headings`);
  } else {
    recommendations.push('Improve heading hierarchy with proper H2, H3, etc. tags');
  }

  // Check for ARIA attributes
  const hasARIA = /aria-/.test(html);
  if (hasARIA) {
    score += 15;
    findings.push('ARIA attributes found for accessibility');
  } else {
    recommendations.push('Add ARIA attributes for better accessibility and AI understanding');
  }

  // Check for proper link structure
  const linkCount = (html.match(/<a[^>]*href/gi) || []).length;
  if (linkCount >= 5) {
    score += 10;
    findings.push(`Good internal link structure with ${linkCount} links`);
  } else {
    recommendations.push('Improve internal linking structure');
  }

  // Check for alt attributes on images
  const images = html.match(/<img[^>]*>/gi) || [];
  const imagesWithAlt = html.match(/<img[^>]*alt=["'][^"']*["'][^>]*>/gi) || [];
  const altPercentage = images.length > 0 ? (imagesWithAlt.length / images.length) * 100 : 100;
  
  if (altPercentage >= 90) {
    score += 10;
    findings.push(`Excellent image accessibility: ${Math.round(altPercentage)}% of images have alt text`);
  } else {
    recommendations.push(`Improve image alt text coverage (currently ${Math.round(altPercentage)}%)`);
  }

  const status = score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'needs_improvement' : 'critical';

  return { score, status, findings, recommendations };
}

async function analyzePageSpeed(url: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  try {
    // Simulate page speed analysis (in real implementation, would use Google PageSpeed Insights API)
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIReadinessBot/1.0; +https://example.com/bot)'
      }
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Analyze response time
    if (responseTime < 1000) {
      score += 40;
      findings.push(`Excellent response time: ${responseTime}ms`);
    } else if (responseTime < 2000) {
      score += 25;
      findings.push(`Good response time: ${responseTime}ms`);
    } else {
      recommendations.push(`Improve server response time (currently ${responseTime}ms)`);
    }

    // Check content size
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      if (sizeKB < 500) {
        score += 20;
        findings.push(`Optimal page size: ${Math.round(sizeKB)}KB`);
      } else if (sizeKB < 1000) {
        score += 10;
        findings.push(`Acceptable page size: ${Math.round(sizeKB)}KB`);
      } else {
        recommendations.push(`Reduce page size (currently ${Math.round(sizeKB)}KB)`);
      }
    }

    // Check compression
    const contentEncoding = response.headers.get('content-encoding');
    if (contentEncoding && (contentEncoding.includes('gzip') || contentEncoding.includes('brotli'))) {
      score += 20;
      findings.push(`Compression enabled: ${contentEncoding}`);
    } else {
      recommendations.push('Enable GZIP or Brotli compression');
    }

    // Check caching headers
    const cacheControl = response.headers.get('cache-control');
    if (cacheControl && !cacheControl.includes('no-cache')) {
      score += 20;
      findings.push('Caching headers properly configured');
    } else {
      recommendations.push('Configure proper caching headers');
    }

  } catch (error) {
    console.error('Page speed analysis failed:', error);
    recommendations.push('Unable to analyze page speed - ensure website is accessible');
  }

  const status = score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'needs_improvement' : 'critical';

  return { score, status, findings, recommendations };
}

function analyzeMobileOptimization(html: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  if (!html) {
    return {
      score: 0,
      status: 'critical' as const,
      findings: ['Unable to analyze mobile optimization'],
      recommendations: ['Ensure the website is accessible for analysis']
    };
  }

  // Check viewport meta tag
  const hasViewport = /meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*["']/i.test(html);
  if (hasViewport) {
    score += 30;
    findings.push('Viewport meta tag is present');
  } else {
    recommendations.push('Add viewport meta tag for proper mobile rendering');
  }

  // Check for responsive design indicators
  const hasResponsiveCSS = /@media[^{]*\([^)]*width[^)]*\)/i.test(html);
  if (hasResponsiveCSS) {
    score += 25;
    findings.push('Responsive CSS media queries detected');
  } else {
    recommendations.push('Implement responsive design with CSS media queries');
  }

  // Check for mobile-friendly elements
  const hasTouchFriendly = /apple-mobile-web-app|mobile-web-app|touch-icon/i.test(html);
  if (hasTouchFriendly) {
    score += 20;
    findings.push('Mobile-friendly meta tags detected');
  } else {
    recommendations.push('Add mobile-specific meta tags for better mobile experience');
  }

  // Check for font sizing
  const hasReadableText = !/<font[^>]*size=["']1["']|font-size:\s*[0-9]px/i.test(html);
  if (hasReadableText) {
    score += 15;
    findings.push('No extremely small text detected');
  } else {
    recommendations.push('Ensure text is readable on mobile devices (minimum 16px)');
  }

  // Check for touch-friendly elements
  const hasLargeClickTargets = !/width:\s*[0-9]px.*height:\s*[0-9]px/i.test(html);
  if (hasLargeClickTargets) {
    score += 10;
    findings.push('Touch-friendly element sizing detected');
  } else {
    recommendations.push('Ensure touch targets are at least 44px for mobile usability');
  }

  const status = score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'needs_improvement' : 'critical';

  return { score, status, findings, recommendations };
}

async function analyzeAICrawlerAccess(url: string, domain: string) {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let score = 0;

  try {
    // Check robots.txt
    const robotsUrl = `https://${domain}/robots.txt`;
    try {
      const robotsResponse = await fetch(robotsUrl);
      if (robotsResponse.ok) {
        const robotsContent = await robotsResponse.text();
        
        // Check if crawling is allowed
        const blocksAllCrawlers = /User-agent:\s*\*\s*Disallow:\s*\//i.test(robotsContent);
        if (!blocksAllCrawlers) {
          score += 25;
          findings.push('Robots.txt allows crawler access');
        } else {
          recommendations.push('Robots.txt is blocking all crawlers - adjust if intentional');
        }

        // Check for sitemap reference
        const hasSitemap = /Sitemap:/i.test(robotsContent);
        if (hasSitemap) {
          score += 15;
          findings.push('Sitemap reference found in robots.txt');
        } else {
          recommendations.push('Add sitemap reference to robots.txt');
        }
      } else {
        score += 10; // Assume accessible if no robots.txt
        findings.push('No robots.txt found (crawlers allowed by default)');
      }
    } catch (error) {
      recommendations.push('Unable to check robots.txt - ensure it\'s accessible');
    }

    // Check sitemap accessibility
    const sitemapUrls = [`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`];
    let sitemapFound = false;
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapResponse = await fetch(sitemapUrl);
        if (sitemapResponse.ok) {
          score += 20;
          findings.push('XML sitemap is accessible');
          sitemapFound = true;
          break;
        }
      } catch (error) {
        // Continue to next sitemap URL
      }
    }

    if (!sitemapFound) {
      recommendations.push('Create and submit an XML sitemap');
    }

    // Check for SSL certificate
    if (url.startsWith('https://')) {
      score += 20;
      findings.push('SSL certificate is properly configured');
    } else {
      recommendations.push('Implement SSL certificate for secure connections');
    }

    // Check for clean URL structure
    const urlParts = url.split('/');
    const hasCleanUrls = !urlParts.some(part => part.includes('?') || part.includes('&') || part.includes('='));
    if (hasCleanUrls) {
      score += 10;
      findings.push('Clean URL structure detected');
    } else {
      recommendations.push('Implement clean, readable URL structure');
    }

    // Check response headers for crawler-friendly signals
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('text/html')) {
        score += 10;
        findings.push('Proper content-type header for HTML content');
      } else {
        recommendations.push('Ensure proper content-type headers are set');
      }
    } catch (error) {
      recommendations.push('Unable to check response headers');
    }

  } catch (error) {
    console.error('AI crawler access analysis failed:', error);
    recommendations.push('Unable to complete crawler access analysis');
  }

  const status = score >= 75 ? 'excellent' : score >= 50 ? 'good' : score >= 25 ? 'needs_improvement' : 'critical';

  return { score, status, findings, recommendations };
}

function generatePriorityActions(categories: any) {
  const actions = [];

  // Server-side rendering actions
  if (categories.serverSideRendering.score < 50) {
    actions.push({
      category: 'Server-Side Rendering',
      action: 'Implement server-side rendering for critical content to ensure AI crawlers can access your content',
      impact: 'high' as const,
      difficulty: 'hard' as const,
      estimatedTime: '2-4 weeks'
    });
  }

  // Semantic HTML actions
  if (categories.semanticHTML.score < 60) {
    actions.push({
      category: 'Semantic HTML',
      action: 'Add semantic HTML5 elements and improve heading hierarchy for better content structure',
      impact: 'high' as const,
      difficulty: 'medium' as const,
      estimatedTime: '1-2 weeks'
    });
  }

  // Page speed actions
  if (categories.pageSpeed.score < 70) {
    actions.push({
      category: 'Page Speed',
      action: 'Optimize page loading speed with compression, caching, and asset optimization',
      impact: 'high' as const,
      difficulty: 'medium' as const,
      estimatedTime: '1-3 weeks'
    });
  }

  // Mobile optimization actions
  if (categories.mobileOptimization.score < 70) {
    actions.push({
      category: 'Mobile Optimization',
      action: 'Implement responsive design and mobile-friendly features',
      impact: 'medium' as const,
      difficulty: 'medium' as const,
      estimatedTime: '2-3 weeks'
    });
  }

  // AI crawler access actions
  if (categories.aiCrawlerAccess.score < 60) {
    actions.push({
      category: 'AI Crawler Access',
      action: 'Configure robots.txt, sitemap, and ensure proper crawler accessibility',
      impact: 'medium' as const,
      difficulty: 'easy' as const,
      estimatedTime: '3-5 days'
    });
  }

  // Sort by impact and difficulty
  return actions.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
    
    const aScore = impactOrder[a.impact] * 2 - difficultyOrder[a.difficulty];
    const bScore = impactOrder[b.impact] * 2 - difficultyOrder[b.difficulty];
    
    return bScore - aScore;
  });
}

async function storeTechnicalAnalysis(data: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    await fetch(`${supabaseUrl}/rest/v1/technical_ai_readiness`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        user_id: data.user_id,
        domain: data.domain,
        overall_score: data.analysis.overallScore,
        server_side_rendering_score: data.analysis.categories.serverSideRendering.score,
        semantic_html_score: data.analysis.categories.semanticHTML.score,
        page_speed_score: data.analysis.categories.pageSpeed.score,
        mobile_optimization_score: data.analysis.categories.mobileOptimization.score,
        ai_crawler_access_score: data.analysis.categories.aiCrawlerAccess.score,
        categories_data: data.analysis.categories,
        priority_actions: data.analysis.priorityActions,
        comprehensive: data.comprehensive,
        analyzed_at: new Date().toISOString()
      }),
    });
  } catch (error) {
    console.error('Failed to store technical analysis:', error);
  }
}