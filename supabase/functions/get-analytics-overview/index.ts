// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  readBody,
  getUserId,
  serviceClient,
  rangeStart,
  avg,
  growth,
} from "../_shared/http.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const dateRange: string = body.date_range || "30d";
    const start = rangeStart(dateRange);
    const startIso = start.toISOString();

    const supabase = serviceClient();

    const [content, seo, citations, aiCitations] = await Promise.all([
      supabase
        .from("content_blocks")
        .select("id,title,metadata,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("seo_analyses")
        .select("id,domain,total_score,technical_score,ai_optimization_score,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("citation_checks")
        .select("id,is_cited,engine,citation_position,confidence_score,checked_at")
        .eq("user_id", userId)
        .gte("checked_at", startIso)
        .order("checked_at", { ascending: false })
        .limit(1000),
      supabase
        .from("ai_platform_citations")
        .select("id,platforms,total_citations,average_score,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .limit(1000),
    ]);

    const contentRows = content.data || [];
    const seoRows = seo.data || [];
    const citationRows = citations.data || [];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const inWindow = (d: string | null, from: Date, to?: Date) => {
      if (!d) return false;
      const t = new Date(d).getTime();
      return t >= from.getTime() && (!to || t < to.getTime());
    };

    const weekly = (rows: any[], field: string) => {
      const current = rows.filter((r) => inWindow(r[field], weekAgo)).length;
      const previous = rows.filter((r) => inWindow(r[field], twoWeeksAgo, weekAgo)).length;
      return growth(current, previous);
    };

    const contentScores = contentRows
      .map((r: any) => Number(r.metadata?.optimization?.seoScore ?? r.metadata?.seoScore))
      .filter((n: number) => Number.isFinite(n));

    const citedCount = citationRows.filter((r: any) => r.is_cited).length;
    const citationRate = citationRows.length
      ? Math.round((citedCount / citationRows.length) * 100)
      : 0;

    // Per-engine performance from real citation checks
    const engines = new Map<string, { total: number; cited: number; positions: number[] }>();
    for (const row of citationRows as any[]) {
      const name = row.engine || "unknown";
      const entry = engines.get(name) || { total: 0, cited: 0, positions: [] };
      entry.total += 1;
      if (row.is_cited) entry.cited += 1;
      if (row.citation_position) entry.positions.push(Number(row.citation_position));
      engines.set(name, entry);
    }
    const aiEnginePerformance = Array.from(engines.entries()).map(([engine, e]) => ({
      engine,
      citationRate: Math.round((e.cited / e.total) * 100),
      averagePosition: e.positions.length
        ? Math.round((e.positions.reduce((a, b) => a + b, 0) / e.positions.length) * 10) / 10
        : 0,
      totalQueries: e.total,
      improvement: 0,
    }));

    const topPerformingContent = contentRows.slice(0, 10).map((r: any) => ({
      id: String(r.id),
      title: r.title,
      type: r.metadata?.contentType || r.metadata?.type || "content",
      seoScore: Number(r.metadata?.optimization?.seoScore ?? 0),
      aiScore: Number(r.metadata?.optimization?.aiOptimizationScore ?? 0),
      createdAt: r.created_at,
      views: 0,
      engagement: Number(r.metadata?.optimization?.readabilityScore ?? 0),
    }));

    const payload = {
      totalContent: contentRows.length,
      totalSEOAnalyses: seoRows.length,
      totalCitationChecks: citationRows.length,
      avgContentScore: avg(contentScores),
      avgSEOScore: avg(seoRows.map((r: any) => Number(r.total_score)).filter(Number.isFinite)),
      avgCitationRate: citationRate,
      weeklyGrowth: {
        content: weekly(contentRows, "created_at"),
        seo: weekly(seoRows, "created_at"),
        citations: weekly(citationRows, "checked_at"),
      },
      topPerformingContent,
      aiEnginePerformance,
      aiPlatformChecks: (aiCitations.data || []).length,
      date_range: dateRange,
      generated_at: new Date().toISOString(),
    };

    // analyticsService expects overview/trends/performance shape too
    return json({
      ...payload,
      overview: payload,
      performance: { topContent: topPerformingContent, aiEnginePerformance },
    });
  } catch (e) {
    console.error("get-analytics-overview error", e);
    return errorResponse((e as Error).message || "Failed to load analytics", 500);
  }
});
