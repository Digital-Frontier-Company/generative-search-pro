// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  readBody,
  getUserId,
  serviceClient,
} from "../_shared/http.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const supabase = serviceClient();
    const since = new Date();
    since.setHours(since.getHours() - 24);
    const sinceIso = since.toISOString();

    const [content, seo, citations, events] = await Promise.all([
      supabase
        .from("content_blocks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", sinceIso),
      supabase
        .from("seo_analyses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", sinceIso),
      supabase
        .from("citation_checks")
        .select("is_cited")
        .eq("user_id", userId)
        .gte("checked_at", sinceIso)
        .limit(500),
      supabase
        .from("analytics_events")
        .select("event,created_at")
        .eq("user_id", userId)
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: false })
        .limit(25),
    ]);

    const citationRows = (citations.data || []) as any[];
    const cited = citationRows.filter((r) => r.is_cited).length;

    return json({
      window: "24h",
      contentGenerated: content.count || 0,
      seoAnalyses: seo.count || 0,
      citationChecks: citationRows.length,
      citationRate: citationRows.length ? Math.round((cited / citationRows.length) * 100) : 0,
      recentEvents: events.data || [],
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("get-realtime-metrics error", e);
    return errorResponse((e as Error).message || "Failed to load metrics", 500);
  }
});
