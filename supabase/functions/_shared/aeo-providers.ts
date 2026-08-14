// ============================================================================
// Provider adapters — Lovable AI Gateway
// ============================================================================
// Every engine we measure is reached through one interface so the panel runner
// never branches on provider. Models are gateway model ids ("google/gemini-3.6-flash").
//
// Sampling is deliberately NOT temperature-0 and NOT seeded: the measurement
// premise is that we sample the model's real output distribution the way a user
// would experience it. A pinned seed produces a beautifully stable number that
// describes nothing.

// @ts-ignore -- Deno npm import
import { streamText } from "npm:ai@5";
import { createLovableAiGatewayProvider, gatewayKey } from "./ai-gateway.ts";
import { extractCitations, type ExtractedCitation } from "./aeo-extract.ts";

export interface ProviderResponse {
  text: string;
  citations: ExtractedCitation[];
  raw: unknown;
  promptTokens?: number;
  outputTokens?: number;
  latencyMs: number;
  status: "ok" | "error" | "filtered" | "timeout";
  errorMessage?: string;
}

export const DEFAULT_MODELS = ["google/gemini-3.6-flash"];

/** Vendor segment of a gateway model id, stored on the run row. */
export function vendorOf(model: string): string {
  return model.split("/")[0] || "unknown";
}

const SYSTEM_PROMPT =
  "You are answering as a consumer-facing AI assistant. Answer the question " +
  "directly and concretely, naming specific companies, products or providers " +
  "where relevant. Cite the sources you rely on as full https:// URLs inline " +
  "in the answer. Do not invent URLs — only cite pages you are actually " +
  "drawing on.";

export async function queryModel(
  model: string,
  prompt: string,
  opts: { timeoutMs?: number; temperature?: number } = {},
): Promise<ProviderResponse> {
  const key = gatewayKey();
  const started = Date.now();

  if (!key) {
    return {
      text: "", citations: [], raw: null, latencyMs: 0,
      status: "error", errorMessage: "LOVABLE_API_KEY is not configured",
    };
  }

  const gateway = createLovableAiGatewayProvider(key);

  try {
    const result = streamText({
      model: gateway(model),
      system: SYSTEM_PROMPT,
      prompt,
      temperature: opts.temperature ?? 1,
      abortSignal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
    });

    const text = await result.text;
    const usage = await result.usage;

    return {
      text,
      citations: extractCitations(text),
      raw: { model, finishReason: await result.finishReason },
      promptTokens: usage?.inputTokens ?? undefined,
      outputTokens: usage?.outputTokens ?? undefined,
      latencyMs: Date.now() - started,
      status: text?.trim() ? "ok" : "filtered",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const timedOut = /abort|timeout/i.test(message);
    return {
      text: "", citations: [], raw: null,
      latencyMs: Date.now() - started,
      status: timedOut ? "timeout" : "error",
      errorMessage: message.slice(0, 500),
    };
  }
}
