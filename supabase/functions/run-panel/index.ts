// ============================================================================
// run-panel — enqueues one sampling pass for a prompt panel
// ============================================================================
// For every active prompt in the panel, every configured model must be queried
// N times. That is the methodological point: a single query to a model is one
// draw from a distribution, not a measurement.
//
// This function does NO model calls. It validates the caller, expands the plan
// into durable `sampling_jobs` rows, and kicks the worker. Running the calls
// inline (even under waitUntil) hits the 150s edge idle timeout as soon as the
// panel grows, and loses every uncommitted call with it.

// @ts-ignore -- Deno npm import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-ignore -- Deno npm import
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { DEFAULT_MODELS } from "../_shared/aeo-providers.ts";
import { type BrandSpec } from "../_shared/aeo-extract.ts";
import { createLogger } from "../_shared/obs.ts";
import { kickWorker } from "../_shared/queue.ts";

declare const Deno: any;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });




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
    log.warn("request.missing_panel_id");
    return json({ error: "panel_id required", trace_id: log.trace_id }, 400);
  }

  const runLog = log.child({ panel_id: panelId, user_id: user.id });

  const { data: panel } = await runLog.phase("db.load_panel", () =>
    admin
      .from("prompt_panels")
      .select("id,account_id,brand_id,status")
      .eq("id", panelId)
      .maybeSingle()
  );
  if (!panel) {
    runLog.warn("panel.not_found");
    return json({ error: "panel not found", trace_id: log.trace_id }, 404);
  }

  const { data: membership } = await runLog.phase("db.check_membership", () =>
    admin
      .from("account_members")
      .select("role")
      .eq("account_id", panel.account_id)
      .eq("user_id", user.id)
      .maybeSingle()
  );
  if (!membership) {
    runLog.warn("auth.not_member", { account_id: panel.account_id });
    return json({ error: "Not a member of this account", trace_id: log.trace_id }, 403);
  }

  // Sampling floor comes from the database so the methodology has one source
  // of truth.
  const { data: cfg } = await admin
    .from("methodology_config").select("value").eq("key", "min_runs_brand").maybeSingle();
  const floor = Number(cfg?.value ?? 7);
  const replicates = Math.min(Math.max(Number(body?.replicates ?? floor) || floor, 1), 40);

  const models: string[] = Array.isArray(body?.models) && body.models.length
    ? body.models.filter((m: unknown) => typeof m === "string").slice(0, 6)
    : DEFAULT_MODELS;
  if (!models.length) {
    runLog.warn("config.no_models");
    return json({ error: "No models configured", trace_id: log.trace_id }, 400);
  }

  const { data: prompts } = await runLog.phase("db.load_prompts", () =>
    admin.from("prompts").select("id,text").eq("panel_id", panelId).eq("is_active", true)
  );
  if (!prompts?.length) {
    runLog.warn("panel.no_active_prompts");
    return json({ error: "panel has no active prompts", trace_id: log.trace_id }, 400);
  }

  // The full competitor set, not just the client: competitors measured on the
  // same panel are the control group for later causal lift analysis, and cost
  // nothing extra to extract from responses already collected.
  const { data: brandRows } = await runLog.phase("db.load_brands", () =>
    admin.from("brands").select("id,name,aliases,domain").eq("account_id", panel.account_id)
  );
  const brands: BrandSpec[] = (brandRows ?? []).map((b: any) => ({
    id: b.id, name: b.name, aliases: b.aliases ?? [], domain: b.domain ?? undefined,
  }));

  const jobs = prompts.flatMap((p: any) =>
    models.flatMap((m) =>
      Array.from({ length: replicates }, (_, i) => ({ prompt: p, model: m, replicate: i })),
    )
  );

  runLog.info("plan.built", {
    prompts: prompts.length,
    models,
    replicates,
    brands: brands.length,
    total_calls: jobs.length,
    concurrency: MAX_CONCURRENCY,
    dry_run: dryRun,
  });


  if (dryRun) {
    return json({
      panel_id: panelId,
      trace_id: log.trace_id,
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
  const modelMetrics = new Metrics();   // provider latency
  const dbMetrics = new Metrics();      // persistence latency
  const errorsByReason: Record<string, number> = {};
  let completed = 0;
  let inFlight = 0;

  // The sampling loop routinely exceeds the 150s edge idle timeout (prompts ×
  // models × replicates model calls). Run it as a background task and return
  // immediately; the client polls the scores tables for results.
  const work = (async () => {
    const bgLog = runLog.child({ scope: "background" });
    const startedAt = Date.now();
    bgLog.info("sampling.start", { total_calls: jobs.length });

    // A heartbeat is the difference between "it timed out" and "it timed out
    // after 38/112 calls, all queued behind one model averaging 22s".
    const stopHeartbeat = heartbeat(bgLog, HEARTBEAT_MS, () => ({
      completed,
      remaining: jobs.length - completed,
      in_flight: inFlight,
      calls_per_min: completed
        ? Math.round((completed / Math.max(1, Date.now() - startedAt)) * 60_000)
        : 0,
      model_latency: modelMetrics.summary(),
      stats: { ...stats },
    }));

    try {
      await pooled(jobs, MAX_CONCURRENCY, bgLog, async (job, worker) => {
        const jobLog = bgLog.child({
          worker,
          model: job.model,
          prompt_id: job.prompt.id,
          replicate: job.replicate,
        });
        inFlight++;
        try {
          const result = await queryModel(job.model, job.prompt.text);
          modelMetrics.observe(result.latencyMs);
          modelMetrics.count(`model:${job.model}:${result.status}`);

          if (result.status !== "ok") {
            const reason = result.errorMessage?.slice(0, 120) ?? result.status;
            errorsByReason[reason] = (errorsByReason[reason] ?? 0) + 1;
            jobLog.warn("model.non_ok", {
              status: result.status,
              latency_ms: result.latencyMs,
              error_message: result.errorMessage,
            });
          } else {
            jobLog.debug("model.ok", {
              latency_ms: result.latencyMs,
              output_tokens: result.outputTokens,
              citations: result.citations.length,
            });
          }

          const dbStart = Date.now();
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

          // The unique index on (prompt, model, date, replicate) makes retries
          // safe: a conflict means the job already ran today, not an error.
          if (runErr || !run) {
            dbMetrics.count("runs.insert_skipped");
            jobLog.info("runs.insert_skipped", { error: runErr?.message });
            return;
          }
          if (result.status !== "ok") return;

          const mentions = extractMentions(result.text, brands);
          if (mentions.length) {
            const { error: mErr } = await admin.from("mentions").insert(
              mentions.map((m) => ({
                run_id: run.id,
                brand_id: m.brandId,
                position: m.position,
                sentiment: m.sentiment,
                verbatim: m.verbatim.slice(0, 500),
                is_endorsed: m.isEndorsed,
              })),
            );
            if (mErr) jobLog.error("mentions.insert_failed", { error: mErr.message });
            else stats.mentions += mentions.length;
          }

          if (result.citations.length) {
            // Upsert the source node first so manual classification
            // (source_type, accessibility) survives re-crawls.
            for (const c of result.citations) {
              if (!c.domain) continue;
              await admin.from("sources")
                .upsert({ account_id: panel.account_id, domain: c.domain }, { onConflict: "account_id,domain" });
            }
            const { data: srcs } = await admin
              .from("sources").select("id,domain").eq("account_id", panel.account_id);
            const srcByDomain = new Map((srcs ?? []).map((s: any) => [s.domain, s.id]));

            const { error: cErr } = await admin.from("citations").insert(
              result.citations.map((c) => ({
                run_id: run.id,
                source_id: srcByDomain.get(c.domain) ?? null,
                url: c.url,
                domain: c.domain,
                rank: c.rank,
                anchor_context: c.anchorContext?.slice(0, 1000),
              })),
            );
            if (cErr) jobLog.error("citations.insert_failed", { error: cErr.message });
            else stats.citations += result.citations.length;
          }

          dbMetrics.observe(Date.now() - dbStart);
        } finally {
          inFlight--;
          completed++;
        }
      });

      await bgLog.phase("db.refresh_scores_daily", () =>
        admin.rpc("refresh_scores_daily", { p_date: new Date().toISOString().slice(0, 10) })
      );

      bgLog.info("sampling.finished", {
        duration_ms: Date.now() - startedAt,
        total_calls: jobs.length,
        completed,
        stats: { ...stats },
        model_latency: modelMetrics.summary(),
        db_latency: dbMetrics.summary(),
        errors_by_reason: errorsByReason,
      });
    } catch (err) {
      bgLog.error("sampling.failed", {
        error: err,
        duration_ms: Date.now() - startedAt,
        completed,
        remaining: jobs.length - completed,
        stats: { ...stats },
        model_latency: modelMetrics.summary(),
      });
    } finally {
      stopHeartbeat();
    }
  })();

  // @ts-ignore -- EdgeRuntime is provided by the Supabase edge runtime
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(work);

  runLog.info("request.accepted", { total_calls: jobs.length, duration_ms: log.elapsed() });

  return json(
    {
      panel_id: panelId,
      trace_id: log.trace_id,
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

