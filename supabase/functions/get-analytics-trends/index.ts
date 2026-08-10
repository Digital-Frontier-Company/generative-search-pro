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

    const [content, seo, citations] = await Promise.all([
      supabase
        .from("content_blocks")
        .select("created_at,metadata")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .limit(2000),
      supabase
        .from("seo_analyses")
        .select("created_at,total_score,ai_optimization_score")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .limit(2000),
      supabase
        .from("citation_checks")
        .select("checked_at,is_cited,confidence_score")
        .eq("user_id", userId)
        .gte("checked_at", startIso)
        .limit(2000),
    ]);

    const days: Record<string, any> = {};
    const dayKey = (d: string) => new Date(d).toISOString().split("T")[0];

    const cursor = new Date(start);
    const today = new Date();
    while (cursor <= today) {
      const key = cursor.toISOString().split("T")[0];
      days[key] = {
        date: key,
        contentGenerated: 0,
        seoAnalyses: 0,
        citationChecks: 0,
        _seoScores: [] as number[],
        _aiScores: [] as number[],
      };
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const row of (content.data || []) as any[]) {
      const k = dayKey(row.created_at);
      if (days[k]) days[k].contentGenerated += 1;
    }
    for (const row of (seo.data || []) as any[]) {
      const k = dayKey(row.created_at);
      if (!days[k]) continue;
      days[k].seoAnalyses += 1;
      if (Number.isFinite(Number(row.total_score))) days[k]._seoScores.push(Number(row.total_score));
      if (Number.isFinite(Number(row.ai_optimization_score)))
        days[k]._aiScores.push(Number(row.ai_optimization_score));
    }
    for (const row of (citations.data || []) as any[]) {
      const k = dayKey(row.checked_at);
      if (days[k]) days[k].citationChecks += 1;
    }

    const trends = Object.values(days).map((d: any) => ({
      date: d.date,
      contentGenerated: d.contentGenerated,
      seoAnalyses: d.seoAnalyses,
      citationChecks: d.citationChecks,
      avgSeoScore: d._seoScores.length
        ? Math.round(d._seoScores.reduce((a: number, b: number) => a + b, 0) / d._seoScores.length)
        : 0,
      avgAiScore: d._aiScores.length
        ? Math.round(d._aiScores.reduce((a: number, b: number) => a + b, 0) / d._aiScores.length)
        : 0,
    }));

    return json(trends);
  } catch (e) {
    console.error("get-analytics-trends error", e);
    return errorResponse((e as Error).message || "Failed to load trends", 500);
  }
});
