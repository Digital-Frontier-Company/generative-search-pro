// ============================================================================
// obs.ts — structured logging + latency metrics for edge functions
// ============================================================================
// Every line is a single JSON object so the Supabase log explorer can be
// searched by field (`trace_id`, `phase`, `event`) instead of by substring.
// Idle-timeout diagnosis needs three things the old string logs never gave us:
// a stable trace id per invocation, elapsed-since-start on every line, and
// per-phase / per-job latency distributions.

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  trace_id: string;
  /** ms since the logger was created. */
  elapsed(): number;
  log(level: LogLevel, event: string, fields?: Record<string, unknown>): void;
  debug(event: string, fields?: Record<string, unknown>): void;
  info(event: string, fields?: Record<string, unknown>): void;
  warn(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
  /** Times an awaited phase and logs start/end (or failure) around it. */
  phase<T>(name: string, fn: () => Promise<T>, fields?: Record<string, unknown>): Promise<T>;
  /** Child logger that stamps extra fields onto every line. */
  child(fields: Record<string, unknown>): Logger;
}

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack?.slice(0, 2000) };
  }
  return value;
}

export function createLogger(
  fn: string,
  base: Record<string, unknown> = {},
  startedAt = Date.now(),
  traceId = crypto.randomUUID(),
): Logger {
  const emit = (level: LogLevel, event: string, fields: Record<string, unknown> = {}) => {
    const line = {
      ts: new Date().toISOString(),
      level,
      fn,
      trace_id: traceId,
      elapsed_ms: Date.now() - startedAt,
      event,
      ...base,
      ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, serialize(v)])),
    };
    const text = JSON.stringify(line);
    if (level === "error") console.error(text);
    else if (level === "warn") console.warn(text);
    else console.log(text);
  };

  const logger: Logger = {
    trace_id: traceId,
    elapsed: () => Date.now() - startedAt,
    log: emit,
    debug: (e, f) => emit("debug", e, f),
    info: (e, f) => emit("info", e, f),
    warn: (e, f) => emit("warn", e, f),
    error: (e, f) => emit("error", e, f),
    async phase(name, work, fields = {}) {
      const t0 = Date.now();
      emit("debug", "phase.start", { phase: name, ...fields });
      try {
        const out = await work();
        emit("info", "phase.end", { phase: name, duration_ms: Date.now() - t0, ...fields });
        return out;
      } catch (err) {
        emit("error", "phase.failed", {
          phase: name,
          duration_ms: Date.now() - t0,
          error: err,
          ...fields,
        });
        throw err;
      }
    },
    child(extra) {
      return createLogger(fn, { ...base, ...extra }, startedAt, traceId);
    },
  };

  return logger;
}

/** Streaming latency accumulator — cheap enough to record every job. */
export class Metrics {
  private samples: number[] = [];
  readonly counters: Record<string, number> = {};

  observe(ms: number) {
    this.samples.push(ms);
  }

  count(key: string, by = 1) {
    this.counters[key] = (this.counters[key] ?? 0) + by;
  }

  private quantile(q: number): number {
    if (!this.samples.length) return 0;
    const sorted = [...this.samples].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
    return Math.round(sorted[idx]);
  }

  summary() {
    const n = this.samples.length;
    const total = this.samples.reduce((a, b) => a + b, 0);
    return {
      n,
      mean_ms: n ? Math.round(total / n) : 0,
      p50_ms: this.quantile(0.5),
      p95_ms: this.quantile(0.95),
      max_ms: n ? Math.round(Math.max(...this.samples)) : 0,
      counters: { ...this.counters },
    };
  }
}

/**
 * Emits a periodic progress line while long work runs. Without a heartbeat an
 * invocation that dies at the 150s idle limit leaves no evidence of where it
 * was — the last log is the start line.
 */
export function heartbeat(
  log: Logger,
  everyMs: number,
  snapshot: () => Record<string, unknown>,
): () => void {
  const id = setInterval(() => log.info("progress", snapshot()), everyMs);
  return () => clearInterval(id);
}
