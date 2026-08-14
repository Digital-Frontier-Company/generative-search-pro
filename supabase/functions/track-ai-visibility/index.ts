// ============================================================================
// track-ai-visibility — real AI answer sampling (no simulation)
// ============================================================================
// Sends real queries to live models through the Lovable AI Gateway, then
// measures whether the domain is actually named / cited in the answers.

import { corsHeaders, json, errorResponse, readBody, serviceClient, getUserId } from "../_shared/http.ts";
import { queryModel } from "../_shared/aeo-providers.ts";
import { extractMentions, domainOf } from "../_shared/aeo-extract.ts";

declare const Deno: any;

const DEFAULT_MODELS: Array<{ id: string; label: string }> = [
  { id: "google/gemini-3.6-flash", label: "Gemini" },
  { id: "openai/gpt-5-mini", label: "ChatGPT" },
];

const MAX_QUERIES = 6;

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "").toLowerCase();
}

function brandFromDomain(domain: string): string {
  return domain.split(".")[0].replace(/[-_]/g, " ");
}

function buildQueries(domain: string): string[] {
  const brand = brandFromDomain(domain);
  return [
    `What is ${brand} (${domain}) and what do they do?`,
    `Is ${brand} a good option? What do reviews say?`,
    `What are the best alternatives to ${brand}?`,
    `How much does ${brand} cost and who is it for?`,
    `Who are the leading providers in the same space as ${brand}?`,
    `What problems do customers report with ${brand}?`,
  ];
}

interface Sample {
  query: string;
  text: string;
  ok: boolean;
  cited: boolean;
  position: number | null;
  citationDomains: string[];
}

async function sampleModel(model: { id: string; label: string }, domain: string, queries: string[], competitors: string[]) {
  const brand = brandFromDomain(domain);
  const samples: Sample[] = [];
  const errors: string[] = [];
  const competitorHits: Record<string, number> = {};
  for (const c of competitors) competitorHits[c] = 0;

  for (const query of queries) {
    const res = await queryModel(model.id, query, { timeoutMs: 90_000 });
    const ok = res.status === "ok";
    if (!ok) {
      const msg = `${model.id}: ${res.status}${res.errorMessage ? ` — ${res.errorMessage}` : ""}`;
      console.error("Model query failed:", msg);
      errors.push(msg);
    }
    const text = res.text ?? "";

    const mentions = ok
      ? extractMentions(text, [{ id: domain, name: brand, aliases: [domain], domain }])
      : [];
    const citationDomains = (res.citations ?? []).map((c) => c.domain);
    const citedByUrl = citationDomains.some((d) => d === domain || d.endsWith(`.${domain}`));
    const cited = mentions.length > 0 || citedByUrl;

    // Position = order of the brand among all named brands/citations in the answer
    let position: number | null = null;
    if (cited) {
      if (mentions.length > 0) {
        position = mentions[0].position;
      } else {
        const idx = citationDomains.findIndex((d) => d === domain || d.endsWith(`.${domain}`));
        position = idx >= 0 ? idx + 1 : null;
      }
    }

    if (ok) {
      for (const c of competitors) {
        const hit = extractMentions(text, [{ id: c, name: brandFromDomain(c), aliases: [c], domain: c }]);
        if (hit.length > 0) competitorHits[c] += 1;
      }
    }

    samples.push({ query, text, ok, cited, position, citationDomains });
  }

  const answered = samples.filter((s) => s.ok);
  const citedSamples = samples.filter((s) => s.cited);
  const positions = citedSamples.map((s) => s.position).filter((p): p is number => typeof p === "number");

  const citationRate = answered.length ? Math.round((citedSamples.length / answered.length) * 100) : 0;
  const avgPosition = positions.length
    ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
    : 0;
  const positionBonus = avgPosition > 0 ? Math.max(0, (6 - Math.min(avgPosition, 6)) / 5) * 25 : 0;
  const score = Math.min(100, Math.round(citationRate * 0.75 + positionBonus));

  return {
    platform: model.label,
    model: model.id,
    score,
    citations: citedSamples.length,
    responseRate: answered.length ? Math.round((answered.length / samples.length) * 100) : 0,
    avgPosition,
    trend: "stable" as const,
    lastChecked: new Date().toISOString(),
    sampleQueries: queries,
    citationExamples: samples.map((s) => ({
      query: s.query,
      response: s.text ? s.text.slice(0, 1200) : "No answer returned by the model for this query.",
      cited: s.cited,
      position: s.position ?? undefined,
    })),
    competitorHits,
    answeredCount: answered.length,
    errors,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!Deno.env.get("LOVABLE_API_KEY")) {
      return errorResponse("AI gateway is not configured (LOVABLE_API_KEY missing).", 500);
    }

    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody<any>(req);
    const rawDomain = String(body.domain ?? "").trim();
    if (!rawDomain) return errorResponse("Domain is required", 400);
    const domain = cleanDomain(rawDomain);

    const competitors: string[] = Array.isArray(body.competitors)
      ? body.competitors.map((c: string) => cleanDomain(String(c))).filter(Boolean).slice(0, 5)
      : [];

    const queries: string[] = (Array.isArray(body.target_queries) && body.target_queries.length
      ? body.target_queries.map((q: string) => String(q))
      : buildQueries(domain)
    ).slice(0, MAX_QUERIES);

    console.log("Tracking AI visibility (live) for", domain, "queries:", queries.length);

    const models = DEFAULT_MODELS;
    const platforms = await Promise.all(models.map((m) => sampleModel(m, domain, queries, competitors)));

    const usable = platforms.filter((p) => p.answeredCount > 0);
    if (usable.length === 0) {
      const detail = platforms.flatMap((p) => p.errors).slice(0, 3).join(" | ");
      return errorResponse(
        `No AI platform returned an answer.${detail ? ` Provider said: ${detail}` : ""}`,
        502,
      );
    }

    const overallScore = Math.round(usable.reduce((s, p) => s + p.score, 0) / usable.length);
    const totalCitations = platforms.reduce((s, p) => s + p.citations, 0);
    const posList = usable.filter((p) => p.avgPosition > 0).map((p) => p.avgPosition);
    const averagePosition = posList.length
      ? Math.round((posList.reduce((a, b) => a + b, 0) / posList.length) * 10) / 10
      : 0;

    const totalAnswers = usable.reduce((s, p) => s + p.answeredCount, 0);
    const competitorComparison = competitors.map((c) => {
      const hits = platforms.reduce((s, p) => s + (p.competitorHits[c] ?? 0), 0);
      const cScore = totalAnswers ? Math.round((hits / totalAnswers) * 100) : 0;
      return { competitor: c, score: cScore, difference: overallScore - cScore };
    });

    // Source domains the models actually leaned on
    const sourceCounts: Record<string, number> = {};
    for (const p of platforms) {
      for (const ex of p.citationExamples) {
        for (const url of (ex.response.match(/https?:\/\/[^\s<>()\[\]"'`]+/gi) ?? [])) {
          const d = domainOf(url);
          if (d && d !== domain) sourceCounts[d] = (sourceCounts[d] ?? 0) + 1;
        }
      }
    }
    const topSources = Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([d, count]) => ({ domain: d, count }));

    const recommendations: Array<{ type: string; title: string; description: string; priority: "high" | "medium" | "low"; expectedImpact: string }> = [];

    if (overallScore < 40) {
      recommendations.push({
        type: "authority",
        title: "Build third-party coverage models can cite",
        description: `${domain} was named in only ${totalCitations} of ${totalAnswers} sampled answers. Models cite pages they can verify — directory listings, review sites and press mentions move this number more than on-site copy.`,
        priority: "high",
        expectedImpact: "Higher citation rate across all engines",
      });
    }
    const weak = usable.filter((p) => p.score < 40).map((p) => p.platform);
    if (weak.length) {
      recommendations.push({
        type: "platform",
        title: `Close the gap on ${weak.join(", ")}`,
        description: `These engines answered but did not surface ${domain}. Publish direct, question-shaped answers for the queries where competitors appeared.`,
        priority: "high",
        expectedImpact: "Platform-specific visibility gains",
      });
    }
    if (averagePosition > 3) {
      recommendations.push({
        type: "positioning",
        title: "Improve placement inside answers",
        description: `Average mention position is ${averagePosition}. Being named later in an answer converts far worse than being named first — strengthen category-defining content.`,
        priority: "medium",
        expectedImpact: "Earlier placement in AI answers",
      });
    }
    if (topSources.length) {
      recommendations.push({
        type: "sources",
        title: "Get placed on the sources models rely on",
        description: `The models cited these domains most: ${topSources.slice(0, 4).map((s) => s.domain).join(", ")}. Presence on those pages is the fastest route into the answers.`,
        priority: "high",
        expectedImpact: "Direct citation lift",
      });
    }
    const beaten = competitorComparison.filter((c) => c.difference < 0);
    if (beaten.length) {
      recommendations.push({
        type: "competitive",
        title: `Competitors outrank you: ${beaten.map((c) => c.competitor).join(", ")}`,
        description: "These domains were named more often than yours in the same sampled answers. Review how they are described and match that coverage.",
        priority: "medium",
        expectedImpact: "Share-of-answer recovery",
      });
    }

    // Persist + build the trend from real prior runs
    const db = serviceClient();
    await db.from("ai_visibility_tracking").insert({
      user_id: userId,
      domain,
      overall_score: overallScore,
      citation_potential: usable.length
        ? Math.round(usable.reduce((s, p) => s + (p.answeredCount ? (p.citations / p.answeredCount) * 100 : 0), 0) / usable.length)
        : 0,
      authority_score: overallScore,
      content_optimization: averagePosition > 0 ? Math.max(0, Math.round(100 - averagePosition * 12)) : 0,
      platform_results: platforms.map(({ competitorHits: _c, citationExamples: _e, errors: _err, ...rest }) => rest),
      queries_analyzed: queries,
      recommendations: recommendations.map((r) => r.title),
      analyzed_at: new Date().toISOString(),
    });

    const { data: history } = await db
      .from("ai_visibility_tracking")
      .select("analyzed_at, overall_score, platform_results")
      .eq("user_id", userId)
      .eq("domain", domain)
      .order("analyzed_at", { ascending: false })
      .limit(10);

    const trends = (history ?? []).map((row: any) => ({
      date: new Date(row.analyzed_at).toLocaleDateString(),
      overallScore: row.overall_score ?? 0,
      citations: Array.isArray(row.platform_results)
        ? row.platform_results.reduce((s: number, p: any) => s + (p?.citations ?? 0), 0)
        : 0,
    }));

    // Trend direction from the previous run of the same domain
    const prev = (history ?? [])[1];
    const withTrend = platforms.map((p) => {
      const prevScore = Array.isArray(prev?.platform_results)
        ? prev.platform_results.find((x: any) => x?.platform === p.platform)?.score
        : undefined;
      const trend = typeof prevScore === "number"
        ? (p.score > prevScore ? "up" : p.score < prevScore ? "down" : "stable")
        : "stable";
      const { competitorHits: _c, answeredCount: _a, errors: _err, ...rest } = p;
      return { ...rest, trend };
    });

    return json({
      success: true,
      visibility: {
        domain,
        overallScore,
        totalCitations,
        averagePosition,
        trackingQueries: queries.length,
        platforms: withTrend,
        competitorComparison,
        topSources,
        recommendations,
        trends,
        lastAnalyzed: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in track-ai-visibility:", error);
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(message, 500);
  }
});
