// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  text,
  readBody,
  getUserId,
  serviceClient,
  rangeStart,
} from "../_shared/http.ts";

const csvEscape = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const format: string = body.format || "json";
    const startIso = rangeStart(body.date_range || "30d").toISOString();
    const supabase = serviceClient();

    const [content, seo, citations] = await Promise.all([
      supabase
        .from("content_blocks")
        .select("id,title,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .limit(2000),
      supabase
        .from("seo_analyses")
        .select("domain,total_score,technical_score,ai_optimization_score,created_at")
        .eq("user_id", userId)
        .gte("created_at", startIso)
        .limit(2000),
      supabase
        .from("citation_checks")
        .select("query,domain,engine,is_cited,citation_position,checked_at")
        .eq("user_id", userId)
        .gte("checked_at", startIso)
        .limit(2000),
    ]);

    const payload = {
      exported_at: new Date().toISOString(),
      date_range: body.date_range || "30d",
      content: content.data || [],
      seo_analyses: seo.data || [],
      citation_checks: citations.data || [],
    };

    if (format === "csv") {
      const rows: string[] = [];
      rows.push("Section,Date,Label,Metric1,Metric2,Metric3");
      for (const r of payload.seo_analyses as any[]) {
        rows.push(
          ["SEO Analysis", r.created_at, r.domain, r.total_score, r.technical_score, r.ai_optimization_score]
            .map(csvEscape)
            .join(","),
        );
      }
      for (const r of payload.citation_checks as any[]) {
        rows.push(
          ["Citation Check", r.checked_at, r.query, r.engine, r.is_cited ? "cited" : "not cited", r.citation_position ?? ""]
            .map(csvEscape)
            .join(","),
        );
      }
      for (const r of payload.content as any[]) {
        rows.push(["Content", r.created_at, r.title, "", "", ""].map(csvEscape).join(","));
      }
      return text(rows.join("\n"), "text/csv");
    }

    if (format === "pdf") {
      // No PDF renderer in the edge runtime — return a printable HTML report.
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Analytics Report</title></head><body>
        <h1>Analytics Report</h1><p>Range: ${payload.date_range} — generated ${payload.exported_at}</p>
        <h2>SEO Analyses (${payload.seo_analyses.length})</h2>
        <ul>${(payload.seo_analyses as any[]).map((r) => `<li>${r.domain}: ${r.total_score}</li>`).join("")}</ul>
        <h2>Citation Checks (${payload.citation_checks.length})</h2>
        <ul>${(payload.citation_checks as any[]).map((r) => `<li>${r.query} — ${r.is_cited ? "cited" : "not cited"}</li>`).join("")}</ul>
      </body></html>`;
      return text(html, "text/html");
    }

    return json(payload);
  } catch (e) {
    console.error("export-analytics error", e);
    return errorResponse((e as Error).message || "Export failed", 500);
  }
});
