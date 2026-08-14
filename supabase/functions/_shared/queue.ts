// ============================================================================
// queue.ts — helpers for the durable sampling queue
// ============================================================================
// Edge invocations are capped by a 150s idle timeout, and `EdgeRuntime.waitUntil`
// only buys a slightly longer wall clock — neither survives a panel with
// hundreds of model calls. Work is therefore persisted as rows and drained by a
// worker that processes a bounded slice per invocation and hands off to a fresh
// invocation before its own budget expires.

declare const Deno: any;

/** Fire a worker invocation without waiting for it to finish. */
export function kickWorker(batchId: string, reason: string): void {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/run-panel-worker`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const req = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "x-worker-key": key,
    },
    body: JSON.stringify({ batch_id: batchId, reason }),
  })
    .then((r) => r.text().catch(() => ""))
    .catch((err) => console.error(JSON.stringify({ event: "worker.kick_failed", error: String(err) })));

  // The handoff must outlive the response, but must never block it.
  // @ts-ignore -- EdgeRuntime is provided by the Supabase edge runtime
  if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(req);
}

/** Constant-time-ish check that a caller presented the service role key. */
export function isTrustedWorkerCall(req: Request): boolean {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!key) return false;
  const header = req.headers.get("x-worker-key") ??
    (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  return header === key;
}
