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

  // The full competitor set is loaded by the worker; here we only need a count
  // for the plan log.
  const { count: brandCount } = await admin
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("account_id", panel.account_id);

  const jobs = prompts.flatMap((p: any) =>
    models.flatMap((m) =>
      Array.from({ length: replicates }, (_, i) => ({ prompt_id: p.id, model: m, replicate_idx: i })),
    )
  );

  runLog.info("plan.built", {
    prompts: prompts.length,
    models,
    replicates,
    brands: brandCount ?? 0,
    total_calls: jobs.length,
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
      note: "dry_run — nothing enqueued",
    });
  }

  // Refuse to stack a second batch on top of a live one: duplicate runs collide
  // on the (prompt, model, date, replicate) index and just burn quota.
  const { data: openBatch } = await admin
    .from("sampling_batches")
    .select("id,status,total_jobs,completed_jobs,failed_jobs")
    .eq("panel_id", panelId)
    .in("status", ["queued", "running"])
    .order("created_at", { ascending: false })
    .maybeSingle();

  if (openBatch) {
    runLog.info("batch.already_running", { batch_id: openBatch.id });
    kickWorker(openBatch.id, "resume");
    return json(
      {
        panel_id: panelId,
        batch_id: openBatch.id,
        trace_id: log.trace_id,
        status: "running",
        calls_attempted: openBatch.total_jobs,
        completed: openBatch.completed_jobs,
        failed: openBatch.failed_jobs,
        note: "A sampling batch is already running for this panel — resumed it instead of starting a second one.",
      },
      202,
    );
  }

  const { data: batch, error: batchErr } = await admin
    .from("sampling_batches")
    .insert({
      account_id: panel.account_id,
      panel_id: panelId,
      status: "queued",
      total_jobs: jobs.length,
      replicates,
      models,
      trace_id: log.trace_id,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (batchErr || !batch) {
    runLog.error("batch.insert_failed", { error: batchErr?.message });
    return json({ error: "Could not queue sampling batch", trace_id: log.trace_id }, 500);
  }

  // Chunked insert: a single statement with thousands of rows is its own
  // timeout risk.
  const CHUNK = 500;
  for (let i = 0; i < jobs.length; i += CHUNK) {
    const { error: jobsErr } = await admin
      .from("sampling_jobs")
      .insert(jobs.slice(i, i + CHUNK).map((j) => ({ ...j, batch_id: batch.id })));
    if (jobsErr) {
      runLog.error("jobs.insert_failed", { error: jobsErr.message, offset: i });
      await admin
        .from("sampling_batches")
        .update({ status: "failed", error: jobsErr.message, finished_at: new Date().toISOString() })
        .eq("id", batch.id);
      return json({ error: "Could not queue sampling jobs", trace_id: log.trace_id }, 500);
    }
  }

  kickWorker(batch.id, "enqueue");

  runLog.info("request.accepted", {
    batch_id: batch.id,
    total_calls: jobs.length,
    duration_ms: log.elapsed(),
  });

  return json(
    {
      panel_id: panelId,
      batch_id: batch.id,
      trace_id: log.trace_id,
      status: "queued",
      calls_attempted: jobs.length,
      prompts: prompts.length,
      models,
      replicates,
      note: "Sampling queued — a background worker drains it and scores refresh when it finishes.",
    },
    202,
  );
});


