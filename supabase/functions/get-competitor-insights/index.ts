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
    const startIso = rangeStart(body.date_range || "30d").toISOString();
    const supabase = serviceClient();

    const [analyses, citations] = await Promise.all([
      supabase
        .from("competitor_analyses")
        .select("competitor_domains,competitor_analyses,gap_opportunities,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("citation_checks")
        .select("competitors_found,is_cited,citation_position,checked_at")
        .eq("user_id", userId)
        .gte("checked_at", startIso)
        .limit(1000),
    ]);

    const stats = new Map<
      string,
      { mentions: number; positions: number[]; gaps: number }
    >();
    const bump = (domain: string, position?: number, gaps = 0) => {
      const key = String(domain).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
      if (!key) return;
      const entry = stats.get(key) || { mentions: 0, positions: [], gaps: 0 };
      entry.mentions += 1;
      if (position) entry.positions.push(position);
      entry.gaps += gaps;
      stats.set(key, entry);
    };

    for (const row of (citations.data || []) as any[]) {
      const found = row.competitors_found;
      const list = Array.isArray(found) ? found : found?.competitors || [];
      for (const c of list) {
        const domain = typeof c === "string" ? c : c?.domain || c?.url;
        const position = typeof c === "object" ? Number(c?.position) || undefined : undefined;
        if (domain) bump(domain, position);
      }
    }

    for (const row of (analyses.data || []) as any[]) {
      const domains = Array.isArray(row.competitor_domains) ? row.competitor_domains : [];
      const gapCount = Array.isArray(row.gap_opportunities) ? row.gap_opportunities.length : 0;
      for (const d of domains) bump(d, undefined, gapCount);
    }

    const totalMentions = Array.from(stats.values()).reduce((a, s) => a + s.mentions, 0) || 1;

    const insights = Array.from(stats.entries())
      .map(([domain, s]) => {
        const averagePosition = s.positions.length
          ? Math.round((s.positions.reduce((a, b) => a + b, 0) / s.positions.length) * 10) / 10
          : 0;
        const citationShare = Math.round((s.mentions / totalMentions) * 100);
        return {
          domain,
          citationShare,
          averagePosition,
          gapsIdentified: s.gaps,
          opportunityScore: Math.max(
            0,
            Math.min(100, Math.round(citationShare * 2 + s.gaps * 3 + (averagePosition ? (10 - averagePosition) * 3 : 0))),
          ),
        };
      })
      .sort((a, b) => b.citationShare - a.citationShare)
      .slice(0, 10);

    return json(insights);
  } catch (e) {
    console.error("get-competitor-insights error", e);
    return errorResponse((e as Error).message || "Failed to load competitor insights", 500);
  }
});
