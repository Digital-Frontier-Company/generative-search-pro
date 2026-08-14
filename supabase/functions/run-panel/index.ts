// ============================================================================
// run-panel — executes one sampling pass for a prompt panel
// ============================================================================
// For every active prompt in the panel it queries every configured model N
// times, stores the full response, and derives mentions and citations.
//
// The replicate loop is the entire methodological point: a single query to a
// model is one draw from a distribution, not a measurement. Identical same-day
// prompts return source sets overlapping only 34-42%.
//
// Concurrency is bounded — an unbounded fan-out here is not a slow job, it is a
// rate-limit storm that turns real answers into error rows, which then read as
// non-mentions and depress the score.

// @ts-ignore -- Deno npm import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-ignore -- Deno npm import
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { DEFAULT_MODELS, queryModel, vendorOf } from "../_shared/aeo-providers.ts";
import { extractMentions, type BrandSpec } from "../_shared/aeo-extract.ts";
import { createLogger, heartbeat, Metrics, type Logger } from "../_shared/obs.ts";

declare const Deno: any;

const MAX_CONCURRENCY = 4;
const HEARTBEAT_MS = 15_000;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function pooled<T>(
  items: T[],
  limit: number,
  log: Logger,
  fn: (item: T, worker: number) => Promise<void>,
) {
  const queue = items.map((item, idx) => ({ item, idx }));
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async (_, worker) => {
    while (queue.length) {
      const next = queue.shift();
      if (next === undefined) break;
      try {
        await fn(next.item, worker);
      } catch (err) {
        log.error("job.uncaught", { worker, job_idx: next.idx, error: err });
      }
    }
  });
  await Promise.all(workers);
}


Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const log = createLogger("run-panel");
  log.info("request.received", { method: req.method });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Caller must be a signed-in member of the panel's account.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    log.warn("auth.missing_header");
    return json({ error: "Missing Authorization header", trace_id: log.trace_id }, 401);
  }

  const { data: userData, error: userErr } = await log.phase(
    "auth.getUser",
    () => admin.auth.getUser(token),
  );
  const user = userData?.user;
  if (userErr || !user) {
    log.warn("auth.invalid_session", { error: userErr });
    return json({ error: "Invalid or expired session", trace_id: log.trace_id }, 401);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    log.warn("request.invalid_json");
    return json({ error: "Invalid JSON body", trace_id: log.trace_id }, 400);
  }


  const panelId: string | undefined = body?.panel_id;
  const dryRun: boolean = Boolean(body?.dry_run);
  if (!panelId || typeof panelId !== "string") {
    return json({ error: "panel_id required" }, 400);
  }

  const { data: panel } = await admin
    .from("prompt_panels")
    .select("id,account_id,brand_id,status")
    .eq("id", panelId)
    .maybeSingle();
  if (!panel) return json({ error: "panel not found" }, 404);

  const { data: membership } = await admin
    .from("account_members")
    .select("role")
    .eq("account_id", panel.account_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return json({ error: "Not a member of this account" }, 403);

  // Sampling floor comes from the database so the methodology has one source
  // of truth.
  const { data: cfg } = await admin
    .from("methodology_config").select("value").eq("key", "min_runs_brand").maybeSingle();
  const floor = Number(cfg?.value ?? 7);
  const replicates = Math.min(Math.max(Number(body?.replicates ?? floor) || floor, 1), 40);

  const models: string[] = Array.isArray(body?.models) && body.models.length
    ? body.models.filter((m: unknown) => typeof m === "string").slice(0, 6)
    : DEFAULT_MODELS;
  if (!models.length) return json({ error: "No models configured" }, 400);

  const { data: prompts } = await admin
    .from("prompts").select("id,text").eq("panel_id", panelId).eq("is_active", true);
  if (!prompts?.length) return json({ error: "panel has no active prompts" }, 400);

  // The full competitor set, not just the client: competitors measured on the
  // same panel are the control group for later causal lift analysis, and cost
  // nothing extra to extract from responses already collected.
  const { data: brandRows } = await admin
    .from("brands").select("id,name,aliases,domain").eq("account_id", panel.account_id);
  const brands: BrandSpec[] = (brandRows ?? []).map((b: any) => ({
    id: b.id, name: b.name, aliases: b.aliases ?? [], domain: b.domain ?? undefined,
  }));

  const jobs = prompts.flatMap((p: any) =>
    models.flatMap((m) =>
      Array.from({ length: replicates }, (_, i) => ({ prompt: p, model: m, replicate: i })),
    )
  );

  if (dryRun) {
    return json({
      panel_id: panelId,
      prompts: prompts.length,
      models,
      replicates,
      total_calls: jobs.length,
      note: "dry_run — nothing executed",
    });
  }

  const stats: Record<string, number> = {
    ok: 0, error: 0, timeout: 0, filtered: 0, mentions: 0, citations: 0,
  };

  // The sampling loop routinely exceeds the 150s edge idle timeout (prompts ×
  // models × replicates model calls). Run it as a background task and return
  // immediately; the client polls the scores tables for results.
  const work = (async () => {
  await pooled(jobs, MAX_CONCURRENCY, async (job) => {

    const result = await queryModel(job.model, job.prompt.text);

    const { data: run, error: runErr } = await admin
      .from("runs")
      .insert({
        prompt_id: job.prompt.id,
        model: job.model,
        provider: vendorOf(job.model),
        replicate_idx: job.replicate,
        raw_response: result.text,
        response_json: result.raw,
        prompt_tokens: result.promptTokens,
        output_tokens: result.outputTokens,
        latency_ms: result.latencyMs,
        status: result.status,
        error_message: result.errorMessage,
      })
      .select("id").maybeSingle();

    stats[result.status] = (stats[result.status] ?? 0) + 1;

    // The unique index on (prompt, model, date, replicate) makes retries safe:
    // a conflict means the job already ran today, which is not an error.
    if (runErr || !run) return;
    if (result.status !== "ok") return;

    const mentions = extractMentions(result.text, brands);
    if (mentions.length) {
      await admin.from("mentions").insert(
        mentions.map((m) => ({
          run_id: run.id,
          brand_id: m.brandId,
          position: m.position,
          sentiment: m.sentiment,
          verbatim: m.verbatim.slice(0, 500),
          is_endorsed: m.isEndorsed,
        })),
      );
      stats.mentions += mentions.length;
    }

    if (result.citations.length) {
      // Upsert the source node first so manual classification (source_type,
      // accessibility) survives re-crawls.
      for (const c of result.citations) {
        if (!c.domain) continue;
        await admin.from("sources")
          .upsert({ account_id: panel.account_id, domain: c.domain }, { onConflict: "account_id,domain" });
      }
      const { data: srcs } = await admin
        .from("sources").select("id,domain").eq("account_id", panel.account_id);
      const srcByDomain = new Map((srcs ?? []).map((s: any) => [s.domain, s.id]));

      await admin.from("citations").insert(
        result.citations.map((c) => ({
          run_id: run.id,
          source_id: srcByDomain.get(c.domain) ?? null,
          url: c.url,
          domain: c.domain,
          rank: c.rank,
          anchor_context: c.anchorContext?.slice(0, 1000),
        })),
      );
      stats.citations += result.citations.length;
    }
  });

    await admin.rpc("refresh_scores_daily", { p_date: new Date().toISOString().slice(0, 10) });
    console.log("run-panel finished", { panelId, ...stats });
  })().catch((err) => console.error("run-panel background failure", err));

  // @ts-ignore -- EdgeRuntime is provided by the Supabase edge runtime
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);

  return json(
    {
      panel_id: panelId,
      status: "running",
      calls_attempted: jobs.length,
      prompts: prompts.length,
      models,
      replicates,
      note: "Sampling started in the background — scores refresh when it finishes.",
    },
    202,
  );

});
