// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  readBody,
  getUserId,
  serviceClient,
  cleanDomain,
} from "../_shared/http.ts";

declare const Deno: any;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const count = (html: string, re: RegExp) => (html.match(re) || []).length;

function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function keywordDensity(body: string, topN = 8) {
  const stop = new Set(
    "the a an and or but of to in for on with is are was were be been this that it as at by from your you we our their they what how why when where can will more most other some such no not only own same than then".split(
      " ",
    ),
  );
  const words = body.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  const total = words.length || 1;
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .reduce((acc, [w, c]) => {
      acc[w] = Math.round((c / total) * 1000) / 10;
      return acc;
    }, {} as Record<string, number>);
}

function readability(body: string): number {
  const sentences = (body.match(/[.!?]+/g) || []).length || 1;
  const words = (body.match(/\S+/g) || []).length || 1;
  const syllables = (body.toLowerCase().match(/[aeiouy]{1,2}/g) || []).length || 1;
  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return clamp(score);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const domain = cleanDomain(body.domain);
    if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      return errorResponse("A valid domain is required", 400);
    }
    const analysisType: string = body.analysis_type || "comprehensive";

    // ---- Fetch the site --------------------------------------------------
    const started = Date.now();
    let html = "";
    let status = 0;
    let secure = false;
    let finalUrl = `https://${domain}/`;
    try {
      const res = await fetch(finalUrl, {
        headers: { "User-Agent": "GenerativeSearchProBot/1.0 (+seo-audit)" },
        redirect: "follow",
      });
      status = res.status;
      finalUrl = res.url;
      secure = res.url.startsWith("https://");
      html = await res.text();
    } catch (_e) {
      return errorResponse(
        `Could not reach ${domain}. Check the domain and try again.`,
        502,
      );
    }
    const ttfb = Date.now() - started;

    if (status >= 400 || !html) {
      return errorResponse(`${domain} returned HTTP ${status}`, 502);
    }

    // ---- Extract signals -------------------------------------------------
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
    const metaDescription = (
      html.match(
        /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i,
      )?.[1] || ""
    ).trim();
    const canonical = /rel=["']canonical["']/i.test(html);
    const viewport = /name=["']viewport["']/i.test(html);
    const langAttr = /<html[^>]+lang=/i.test(html);
    const ogTags = count(html, /<meta[^>]+property=["']og:/gi);
    const jsonLdBlocks =
      html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
    const schemaTypes = Array.from(
      new Set(
        jsonLdBlocks
          .map((b) => b.match(/"@type"\s*:\s*"([^"]+)"/i)?.[1])
          .filter(Boolean) as string[],
      ),
    );
    const h1s = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)).map((m) =>
      textOf(m[1]),
    );
    const headingStructure = Array.from(
      html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi),
    )
      .slice(0, 40)
      .map((m) => {
        const text = textOf(m[2]);
        return {
          level: Number(m[1]),
          text,
          aiOptimized: /\?$/.test(text) || text.split(" ").length <= 10,
        };
      });
    const images = count(html, /<img\b/gi);
    const imagesWithAlt = count(html, /<img[^>]+alt=["'][^"']+["']/gi);
    const links = count(html, /<a\b[^>]+href=/gi);
    const internalLinks = count(
      html,
      new RegExp(`<a[^>]+href=["'](?:/|https?://(?:www\\.)?${domain})`, "gi"),
    );
    const lists = count(html, /<(ul|ol)\b/gi);
    const tables = count(html, /<table\b/gi);
    const scripts = count(html, /<script\b/gi);
    const body = textOf(html);
    const wordCount = (body.match(/\S+/g) || []).length;
    const questionHeadings = headingStructure.filter((h) =>
      /^(what|how|why|when|where|who|can|does|is|are)\b|\?$/i.test(h.text),
    ).length;
    const faqSections =
      (schemaTypes.includes("FAQPage") ? 1 : 0) +
      count(html, /id=["'][^"']*faq[^"']*["']/gi);
    const pageBytes = html.length;

    let robotsOk = false;
    let sitemapOk = false;
    let llmsTxt = false;
    try {
      const [robots, sitemap, llms] = await Promise.all([
        fetch(`https://${domain}/robots.txt`).catch(() => null),
        fetch(`https://${domain}/sitemap.xml`).catch(() => null),
        fetch(`https://${domain}/llms.txt`).catch(() => null),
      ]);
      robotsOk = !!robots && robots.ok;
      sitemapOk = !!sitemap && sitemap.ok;
      llmsTxt = !!llms && llms.ok;
      await Promise.all(
        [robots, sitemap, llms].map((r) => r?.text().catch(() => "")),
      );
    } catch (_e) {
      // non-fatal
    }

    // ---- Scores ----------------------------------------------------------
    const technical_score = clamp(
      (title ? 15 : 0) +
        (title.length >= 30 && title.length <= 65 ? 5 : 0) +
        (metaDescription ? 12 : 0) +
        (metaDescription.length >= 110 && metaDescription.length <= 165 ? 5 : 0) +
        (h1s.length === 1 ? 12 : h1s.length > 1 ? 5 : 0) +
        (canonical ? 8 : 0) +
        (robotsOk ? 8 : 0) +
        (sitemapOk ? 10 : 0) +
        (langAttr ? 5 : 0) +
        (schemaTypes.length ? 12 : 0) +
        (ogTags >= 3 ? 8 : ogTags ? 4 : 0),
    );

    const performance_score = clamp(
      100 -
        Math.min(35, Math.max(0, (ttfb - 200) / 40)) -
        Math.min(30, Math.max(0, (pageBytes - 120_000) / 20_000)) -
        Math.min(25, Math.max(0, (scripts - 8) * 2.5)),
    );

    const content_score = clamp(
      Math.min(35, wordCount / 25) +
        Math.min(15, headingStructure.length * 1.5) +
        Math.min(12, lists * 2) +
        (questionHeadings ? Math.min(13, questionHeadings * 4) : 0) +
        Math.min(10, internalLinks / 3) +
        (readability(body) >= 50 ? 15 : 8),
    );

    const mobile_score = clamp(
      (viewport ? 55 : 10) +
        (pageBytes < 400_000 ? 25 : 10) +
        (/media=["'][^"']*max-width/i.test(html) || /responsive/i.test(html) ? 10 : 5) +
        (images && imagesWithAlt / images > 0.6 ? 10 : 5),
    );

    const security_score = clamp(
      (secure ? 60 : 0) +
        (/upgrade-insecure-requests|content-security-policy/i.test(html) ? 15 : 0) +
        (!/http:\/\/(?!localhost)/i.test(html) ? 25 : 5),
    );

    const ux_score = clamp(
      (images ? (imagesWithAlt / images) * 25 : 20) +
        (viewport ? 20 : 0) +
        Math.min(20, links / 3) +
        (headingStructure.length >= 3 ? 20 : 8) +
        (readability(body) >= 55 ? 15 : 7),
    );

    const ai_readiness_score = clamp(
      (schemaTypes.length ? 20 : 0) +
        (schemaTypes.includes("FAQPage") ? 10 : 0) +
        (questionHeadings ? Math.min(15, questionHeadings * 5) : 0) +
        (lists ? Math.min(10, lists * 2) : 0) +
        (llmsTxt ? 10 : 0) +
        (wordCount > 600 ? 15 : wordCount > 300 ? 8 : 0) +
        (metaDescription ? 8 : 0) +
        (h1s.length === 1 ? 7 : 0) +
        (tables ? 5 : 0),
    );

    const ai_optimization_score = clamp(
      ai_readiness_score * 0.7 + content_score * 0.3,
    );

    const overall_score = clamp(
      technical_score * 0.22 +
        content_score * 0.2 +
        ai_readiness_score * 0.22 +
        performance_score * 0.14 +
        mobile_score * 0.1 +
        security_score * 0.07 +
        ux_score * 0.05,
    );

    // Per-engine readiness weights the signals each engine leans on most.
    const engine = (structured: number, depth: number, speed: number) =>
      clamp(
        ai_readiness_score * structured +
          content_score * depth +
          performance_score * speed,
      );

    // ---- Technical audit -------------------------------------------------
    const technical_audit: any[] = [];
    const addIssue = (
      cond: boolean,
      issue: Record<string, unknown>,
    ) => {
      if (cond) technical_audit.push(issue);
    };

    addIssue(!title, {
      type: "critical",
      category: "technical",
      title: "Missing page title",
      description: "The homepage has no <title> tag.",
      impact: "high",
      solution: "Add a unique 50-60 character title containing your primary keyword.",
      priority: 1,
      aiImpact: "AI engines rely on titles to identify what a page answers.",
    });
    addIssue(!metaDescription, {
      type: "warning",
      category: "content",
      title: "Missing meta description",
      description: "No meta description was found on the homepage.",
      impact: "medium",
      solution: "Write a 150-160 character summary of the page's core answer.",
      priority: 2,
      aiImpact: "Descriptions are frequently reused as AI answer snippets.",
    });
    addIssue(h1s.length !== 1, {
      type: h1s.length === 0 ? "critical" : "warning",
      category: "content",
      title: h1s.length === 0 ? "No H1 heading" : `${h1s.length} H1 headings found`,
      description: "Pages should have exactly one H1 that states the main topic.",
      impact: "high",
      solution: "Keep a single descriptive H1 and demote the rest to H2/H3.",
      priority: 1,
      aiImpact: "Improves AI content extraction and topic attribution.",
    });
    addIssue(schemaTypes.length === 0, {
      type: "warning",
      category: "ai-optimization",
      title: "No structured data detected",
      description: "No JSON-LD schema markup was found.",
      impact: "high",
      solution: "Add Organization, Article and FAQPage JSON-LD to key templates.",
      priority: 1,
      aiImpact: "Structured data is the strongest signal for AI answer citation.",
    });
    addIssue(!schemaTypes.includes("FAQPage"), {
      type: "info",
      category: "ai-optimization",
      title: "No FAQ schema",
      description: "FAQ blocks give AI engines directly quotable Q&A pairs.",
      impact: "medium",
      solution: "Add an FAQ section marked up with FAQPage schema.",
      priority: 2,
      aiImpact: "FAQ pairs are the most commonly cited content format.",
    });
    addIssue(!sitemapOk, {
      type: "warning",
      category: "technical",
      title: "sitemap.xml not reachable",
      description: "Crawlers could not fetch /sitemap.xml.",
      impact: "medium",
      solution: "Publish a sitemap and reference it from robots.txt.",
      priority: 2,
    });
    addIssue(!robotsOk, {
      type: "warning",
      category: "technical",
      title: "robots.txt not reachable",
      description: "Crawlers and AI agents could not fetch /robots.txt.",
      impact: "medium",
      solution: "Publish robots.txt and explicitly allow reputable AI crawlers.",
      priority: 2,
    });
    addIssue(!llmsTxt, {
      type: "info",
      category: "ai-optimization",
      title: "No llms.txt file",
      description: "llms.txt tells AI crawlers which content to prioritise.",
      impact: "low",
      solution: "Publish /llms.txt summarising your key pages.",
      priority: 3,
    });
    addIssue(!secure, {
      type: "critical",
      category: "security",
      title: "Site not served over HTTPS",
      description: "The final URL was not HTTPS.",
      impact: "high",
      solution: "Install a TLS certificate and force HTTPS redirects.",
      priority: 1,
    });
    addIssue(!viewport, {
      type: "critical",
      category: "mobile",
      title: "Missing viewport meta tag",
      description: "The page will not scale correctly on mobile devices.",
      impact: "high",
      solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
      priority: 1,
    });
    addIssue(images > 0 && imagesWithAlt / images < 0.8, {
      type: "warning",
      category: "content",
      title: "Images missing alt text",
      description: `${images - imagesWithAlt} of ${images} images have no alt attribute.`,
      impact: "medium",
      solution: "Describe every meaningful image with concise alt text.",
      priority: 2,
    });
    addIssue(ttfb > 800, {
      type: "warning",
      category: "performance",
      title: "Slow server response",
      description: `First byte took ${ttfb}ms.`,
      impact: "high",
      solution: "Add edge caching / CDN and reduce server work per request.",
      priority: 1,
    });
    addIssue(wordCount < 300, {
      type: "warning",
      category: "content",
      title: "Thin homepage content",
      description: `Only ${wordCount} words of visible text were found.`,
      impact: "medium",
      solution: "Expand the page with substantive, answer-oriented content.",
      priority: 2,
      aiImpact: "Thin pages are rarely selected as AI answer sources.",
    });

    technical_audit.sort((a, b) => a.priority - b.priority);

    // ---- Recommendations & opportunities --------------------------------
    const ai_recommendations = technical_audit.slice(0, 6).map((issue, i) => ({
      priority: issue.type === "critical" ? "critical" : i < 3 ? "high" : "medium",
      category:
        issue.category === "ai-optimization"
          ? "ai-optimization"
          : issue.category === "content"
          ? "content-structure"
          : issue.category === "mobile"
          ? "user-experience"
          : "technical-seo",
      title: issue.title,
      description: issue.description,
      implementation: issue.solution,
      expectedImpact: issue.aiImpact || `Improves ${issue.category} score`,
      timeframe: issue.impact === "high" ? "1-2 weeks" : "2-4 weeks",
      difficulty: issue.impact === "high" ? "medium" : "easy",
      aiEngines: ["ChatGPT", "Perplexity", "Google AI Overviews", "Bing Copilot"],
    }));

    const opportunities = [
      wordCount < 900 && {
        title: "Build depth on your core topic",
        description: `The homepage carries ${wordCount} words. Depth correlates strongly with AI citation.`,
        potentialImpact: "high",
        effort: "medium",
        category: "content",
      },
      !schemaTypes.includes("FAQPage") && {
        title: "Add an FAQ block with FAQPage schema",
        description: "Direct Q&A pairs are the most quoted format in AI answers.",
        potentialImpact: "high",
        effort: "low",
        category: "ai-optimization",
      },
      questionHeadings < 3 && {
        title: "Rewrite headings as questions",
        description: `Only ${questionHeadings} headings are phrased as questions.`,
        potentialImpact: "medium",
        effort: "low",
        category: "content",
      },
      internalLinks < 10 && {
        title: "Strengthen internal linking",
        description: `Only ${internalLinks} internal links were detected on the homepage.`,
        potentialImpact: "medium",
        effort: "low",
        category: "technical",
      },
      performance_score < 70 && {
        title: "Reduce page weight",
        description: `Page is ${Math.round(pageBytes / 1024)}KB with ${scripts} scripts.`,
        potentialImpact: "medium",
        effort: "medium",
        category: "performance",
      },
    ].filter(Boolean);

    const result = {
      domain,
      analysis_type: analysisType,
      analyzed_url: finalUrl,
      overall_score,
      technical_score,
      performance_score,
      content_score,
      mobile_score,
      security_score,
      ai_readiness_score,
      ux_score,
      ai_optimization_score,
      chatgpt_readiness: engine(0.55, 0.35, 0.1),
      bing_readiness: engine(0.45, 0.25, 0.3),
      perplexity_readiness: engine(0.6, 0.3, 0.1),
      claude_readiness: engine(0.4, 0.5, 0.1),
      gemini_readiness: engine(0.5, 0.3, 0.2),
      technical_audit,
      content_analysis: {
        aiStructureScore: ai_readiness_score,
        questionAnswerSections: questionHeadings,
        faqSections,
        listFormatting: lists,
        headingStructure,
        keywordDensity: keywordDensity(body),
        readabilityScore: readability(body),
        wordCount,
        entityRecognition: Object.keys(keywordDensity(body, 6)),
        semanticAnalysis: {
          topicCoverage: clamp(Math.min(100, wordCount / 12)),
          intentMatching: clamp(questionHeadings * 15 + 40),
          contextualRelevance: clamp(content_score * 0.6 + ai_readiness_score * 0.4),
        },
      },
      performance_metrics: {
        coreWebVitals: {
          ttfb,
          lcp: Math.round(ttfb + pageBytes / 900),
          fcp: Math.round(ttfb + pageBytes / 1800),
          cls: Math.round((images > 15 ? 0.18 : 0.05) * 100) / 100,
          fid: Math.min(300, 20 + scripts * 6),
        },
        pageSizeKb: Math.round(pageBytes / 1024),
        requestsScripts: scripts,
        mobileScore: mobile_score,
        desktopScore: clamp(performance_score + 5),
        accessibilityScore: clamp(
          (images ? (imagesWithAlt / images) * 50 : 40) + (langAttr ? 25 : 0) + 25,
        ),
      },
      opportunities,
      ai_recommendations,
      meta: {
        title,
        titleLength: title.length,
        metaDescription,
        metaDescriptionLength: metaDescription.length,
        canonical,
        schemaTypes,
        robotsTxt: robotsOk,
        sitemapXml: sitemapOk,
        llmsTxt,
        https: secure,
      },
      analyzed_at: new Date().toISOString(),
    };

    // ---- Persist ---------------------------------------------------------
    try {
      const supabase = serviceClient();
      await supabase.from("seo_analyses").insert({
        user_id: userId,
        domain,
        technical_score,
        performance_score,
        total_score: overall_score,
        ai_optimization_score,
        accessibility_score: result.performance_metrics.accessibilityScore,
        schema_count: schemaTypes.length,
        status: "completed",
        analysis_data: result,
        recommendations: ai_recommendations,
      });
    } catch (e) {
      console.error("Failed to persist analysis", e);
    }

    return json(result);
  } catch (e) {
    console.error("enhanced-seo-analysis error", e);
    return errorResponse((e as Error).message || "Analysis failed", 500);
  }
});
