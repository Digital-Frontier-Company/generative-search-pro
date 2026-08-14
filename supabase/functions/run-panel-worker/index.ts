// ============================================================================
// run-panel-worker — drains the sampling_jobs queue for one batch
// ============================================================================
// Invoked by run-panel, by itself (handoff), and by cron recovery. Each
// invocation claims a bounded slice of pending jobs, works until its wall-clock
// budget is spent, then hands off to a fresh invocation. No single invocation
// can therefore approach the 150s edge idle timeout, and a worker that dies
// mid-slice only leaves claimed rows, which the cron requeues.

// @ts-ignore -- Deno npm import
import { createClient } from "npm:@supabase/supabase-js@2";
// @ts-ignore -- Deno npm import
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { queryModel, vendorOf } from "../_shared/aeo-providers.ts";
import { extractMentions, type BrandSpec } from "../_shared/aeo-extract.ts";
import { createLogger, heartbeat, Metrics, type Logger } from "../_shared/obs.ts";
import { isTrustedWorkerCall, kickWorker } from "../_shared/queue.ts";

declare const Deno: any;

const MAX_CONCURRENCY = 4;
const CLAIM_SIZE = 8;          // jobs claimed per round
const BUDGET_MS = 80_000;      // hand off well before the 150s idle limit
const HEARTBEAT_MS = 15_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface ClaimedJob {
  job_id: string;
  prompt_id: string;
  model: string;
  replicate_idx: number;
  attempts: number;
}

async function pooled<T>(items: T[], limit: number, log: Logger, fn: (item: T, worker: number) => Promise<void>) {
  const queue = items.slice();
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async (_, worker) => {
    while (queue.length) {
      const next = queue.shift();
      if (next === undefined) break;
      try {
        await fn(next, worker);
      } catch (err) {
        log.error("job.uncaught", { worker, error: err });
      }
    }
  });
  await Promise.all(workers);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!isTrustedWorkerCall(req)) return json({ error: "Forbidden" }, 403);

  const startedAt = Date.now();
  const log = createLogger("run-panel-worker");
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let body: any = {};
  try {
    body = await req.json();
  } catch { /* cron may send an empty body */ }

  // Recovery pass: return abandoned claims to the pool before picking work.
  const { data: requeued } = await admin.rpc("requeue_stale_sampling_jobs", { p_stale_minutes: 5 });
  if (requeued) log.info("jobs.requeued", { count: requeued });

  let batchId: string | undefined = body?.batch_id;
  if (!batchId) {
    const { data: next } = await admin
      .from("sampling_batches")
      .select("id")
      .in("status", ["queued", "running"])
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    batchId = next?.id;
  }
  if (!batchId) {
    log.info("queue.empty");
    return json({ status: "idle", trace_id: log.trace_id });
  }

  const { data: batch } = await admin
    .from("sampling_batches")
    .select("id,account_id,panel_id,status,trace_id")
    .eq("id", batchId)
    .maybeSingle();
  if (!batch) return json({ error: "batch not found", trace_id: log.trace_id }, 404);
  if (["completed", "failed", "cancelled"].includes(batch.status)) {
    return json({ status: batch.status, batch_id: batchId, trace_id: log.trace_id });
  }

  const wlog = log.child({ batch_id: batchId, panel_id: batch.panel_id, run_trace: batch.trace_id });
  const workerId = `${log.trace_id.slice(0, 8)}`;

  // Competitors on the same panel are the control group and cost nothing extra
  // to extract from responses already collected.
  const { data: brandRows } = await admin
    .from("brands").select("id,name,aliases,domain").eq("account_id", batch.account_id);
  const brands: BrandSpec[] = (brandRows ?? []).map((b: any) => ({
    id: b.id, name: b.name, aliases: b.aliases ?? [], domain: b.domain ?? undefined,
  }));

  const { data: promptRows } = await admin
    .from("prompts").select("id,text").in(
      "id",
      // Load prompts lazily per round would N+1; the panel's set is small.
      (await admin.from("prompts").select("id").eq("panel_id", batch.panel_id)).data?.map((p: any) => p.id) ?? [],
    );
  const promptText = new Map((promptRows ?? []).map((p: any) => [p.id, p.text]));

  const stats: Record<string, number> = { ok: 0, error: 0, timeout: 0, filtered: 0, mentions: 0, citations: 0 };
  const modelMetrics = new Metrics();
  const errorsByReason: Record<string, number> = {};
  let processed = 0;
  let inFlight = 0;

  const stopHeartbeat = heartbeat(wlog, HEARTBEAT_MS, () => ({
    processed,
    in_flight: inFlight,
    elapsed_ms: Date.now() - startedAt,
    model_latency: modelMetrics.summary(),
    stats: { ...stats },
  }));

  let pending = 0;
  try {
    while (Date.now() - startedAt < BUDGET_MS) {
      const { data: claimed, error: claimErr } = await admin.rpc("claim_sampling_jobs", {
        p_batch: batchId,
        p_limit: CLAIM_SIZE,
        p_worker: workerId,
      });
      if (claimErr) {
        wlog.error("jobs.claim_failed", { error: claimErr.message });
        break;
      }
      const jobs = (claimed ?? []) as ClaimedJob[];
      if (!jobs.length) break;

      await pooled(jobs, MAX_CONCURRENCY, wlog, async (job, worker) => {
        const jobLog = wlog.child({ worker, model: job.model, prompt_id: job.prompt_id, replicate: job.replicate_idx });
        inFlight++;
        try {
          const text = promptText.get(job.prompt_id);
          if (!text) {
            await admin.from("sampling_jobs")
              .update({ status: "error", error: "prompt missing", finished_at: new Date().toISOString() })
              .eq("id", job.job_id);
            return;
          }

          const result = await queryModel(job.model, text);
          modelMetrics.observe(result.latencyMs);
          modelMetrics.count(`model:${job.model}:${result.status}`);
          stats[result.status] = (stats[result.status] ?? 0) + 1;

          if (result.status !== "ok") {
            const reason = result.errorMessage?.slice(0, 120) ?? result.status;
            errorsByReason[reason] = (errorsByReason[reason] ?? 0) + 1;
            jobLog.warn("model.non_ok", { status: result.status, latency_ms: result.latencyMs, error_message: result.errorMessage });
          }

          const { data: run, error: runErr } = await admin
            .from("runs")
            .insert({
              prompt_id: job.prompt_id,
              model: job.model,
              provider: vendorOf(job.model),
              replicate_idx: job.replicate_idx,
              raw_response: result.text,
              response_json: result.raw,
              prompt_tokens: result.promptTokens,
              output_tokens: result.outputTokens,
              latency_ms: result.latencyMs,
              status: result.status,
              error_message: result.errorMessage,
            })
            .select("id").maybeSingle();

          // The unique index on (prompt, model, date, replicate) makes retries
          // safe: a conflict means the job already ran today, not an error.
          if (runErr || !run) {
            jobLog.info("runs.insert_skipped", { error: runErr?.message });
            await admin.from("sampling_jobs")
              .update({ status: "done", error: runErr?.message ?? null, finished_at: new Date().toISOString() })
              .eq("id", job.job_id);
            return;
          }

          if (result.status === "ok") {
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
              for (const c of result.citations) {
                if (!c.domain) continue;
                await admin.from("sources")
                  .upsert({ account_id: batch.account_id, domain: c.domain }, { onConflict: "account_id,domain" });
              }
              const { data: srcs } = await admin
                .from("sources").select("id,domain").eq("account_id", batch.account_id);
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
          }

          await admin.from("sampling_jobs")
            .update({
              status: result.status === "ok" ? "done" : (job.attempts >= 2 ? "error" : "pending"),
              error: result.errorMessage ?? null,
              finished_at: result.status === "ok" ? new Date().toISOString() : null,
              claimed_at: null,
            })
            .eq("id", job.job_id);
        } catch (err) {
          jobLog.error("job.failed", { error: err });
          await admin.from("sampling_jobs")
            .update({
              status: job.attempts >= 2 ? "error" : "pending",
              error: String((err as Error)?.message ?? err).slice(0, 500),
              claimed_at: null,
            })
            .eq("id", job.job_id);
        } finally {
          inFlight--;
          processed++;
        }
      });

      const { data: settled } = await admin.rpc("settle_sampling_batch", { p_batch: batchId });
      pending = Number(settled?.[0]?.pending ?? 0);
      if (pending === 0) break;
    }

    const { data: settled } = await admin.rpc("settle_sampling_batch", { p_batch: batchId });
    pending = Number(settled?.[0]?.pending ?? 0);

    if (pending > 0) {
      wlog.info("worker.handoff", { processed, pending, elapsed_ms: Date.now() - startedAt });
      kickWorker(batchId, "handoff");
    } else {
      await admin.rpc("refresh_scores_daily", { p_date: new Date().toISOString().slice(0, 10) });
      wlog.info("sampling.finished", {
        processed,
        duration_ms: Date.now() - startedAt,
        stats: { ...stats },
        model_latency: modelMetrics.summary(),
        errors_by_reason: errorsByReason,
      });
    }

    return json({
      status: pending > 0 ? "running" : "completed",
      batch_id: batchId,
      trace_id: log.trace_id,
      processed,
      pending,
    });
  } catch (err) {
    wlog.error("worker.failed", { error: err, processed, elapsed_ms: Date.now() - startedAt });
    return json({ error: "worker failed", trace_id: log.trace_id }, 500);
  } finally {
    stopHeartbeat();
  }
});
