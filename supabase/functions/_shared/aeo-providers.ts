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
import { domainOf, extractCitations, type ExtractedCitation } from "./aeo-extract.ts";

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

/**
 * Assistants to sample when the caller does not name any: the gateway models
 * plus whichever direct-key providers are actually configured. An unconfigured
 * provider is left out rather than sampled into a wall of errors.
 */
export function availableModels(): string[] {
  return MODEL_CATALOG.filter((m) => !m.secret || Boolean(Deno.env.get(m.secret))).map((m) => m.id);
}

/**
 * Assistants we can sample today. `via` decides the transport: gateway models go
 * through the Lovable AI Gateway, the others hold their own API key because the
 * gateway does not carry them.
 */
export const MODEL_CATALOG: {
  id: string;
  label: string;
  via: "gateway" | "perplexity" | "anthropic";
  secret?: string;
}[] = [
  { id: "google/gemini-3.6-flash", label: "Gemini", via: "gateway" },
  { id: "openai/gpt-5.4-mini", label: "ChatGPT", via: "gateway" },
  { id: "perplexity/sonar", label: "Perplexity", via: "perplexity", secret: "PERPLEXITY_API_KEY" },
  {
    id: "anthropic/claude-sonnet-4-5",
    label: "Claude",
    via: "anthropic",
    secret: "ANTHROPIC_API_KEY",
  },
];

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

function errorResponse(message: string, started: number, timedOut = false): ProviderResponse {
  return {
    text: "",
    citations: [],
    raw: null,
    latencyMs: Date.now() - started,
    status: timedOut ? "timeout" : "error",
    errorMessage: message.slice(0, 500),
  };
}

/**
 * Route a sampling call to the right transport.
 *
 * An unconfigured provider returns an error, never an empty answer: an empty
 * answer would be recorded as a successful run in which the brand went
 * unmentioned, quietly biasing answer share downwards.
 */
export async function queryModel(
  model: string,
  prompt: string,
  opts: { timeoutMs?: number; temperature?: number } = {},
): Promise<ProviderResponse> {
  const vendor = vendorOf(model);
  if (vendor === "perplexity") return queryPerplexity(model, prompt, opts);
  if (vendor === "anthropic") return queryAnthropic(model, prompt, opts);
  return queryGateway(model, prompt, opts);
}

/**
 * Perplexity is not on the Lovable gateway and is worth calling directly anyway:
 * it returns a structured `citations` array, so the source graph is built from
 * the URLs it actually retrieved rather than from links parsed out of prose.
 */
async function queryPerplexity(
  model: string,
  prompt: string,
  opts: { timeoutMs?: number; temperature?: number },
): Promise<ProviderResponse> {
  const started = Date.now();
  const key = Deno.env.get("PERPLEXITY_API_KEY");
  if (!key) return errorResponse("PERPLEXITY_API_KEY is not configured", started);

  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.split("/")[1] || "sonar",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: opts.temperature ?? 1,
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 401 && body.includes("insufficient_quota")) {
        return errorResponse(
          "Perplexity API credits are exhausted. Buy credits at https://console.perplexity.ai " +
            "for the account this key belongs to — API credits are separate from a Pro subscription.",
          started,
        );
      }
      return errorResponse(`Perplexity request failed [${res.status}]: ${body}`, started);
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const structured: string[] = Array.isArray(data?.citations) ? data.citations : [];

    // Prefer the structured citation list; fall back to URLs named in the prose.
    const citations: ExtractedCitation[] = structured.length
      ? structured
          .map((url, i) => ({ url: String(url).slice(0, 2000), domain: domainOf(String(url)), rank: i + 1 }))
          .filter((c) => c.domain)
      : extractCitations(text);

    return {
      text,
      citations,
      raw: { model, citations: structured },
      promptTokens: data?.usage?.prompt_tokens,
      outputTokens: data?.usage?.completion_tokens,
      latencyMs: Date.now() - started,
      status: text.trim() ? "ok" : "filtered",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(message, started, /abort|timeout/i.test(message));
  }
}

/** Claude, called on its own API — the gateway catalog does not carry Anthropic ids. */
async function queryAnthropic(
  model: string,
  prompt: string,
  opts: { timeoutMs?: number; temperature?: number },
): Promise<ProviderResponse> {
  const started = Date.now();
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return errorResponse("ANTHROPIC_API_KEY is not configured", started);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model.split("/")[1] || "claude-sonnet-4-5",
        max_tokens: 1500,
        temperature: opts.temperature ?? 1,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
    });

    if (!res.ok) {
      const body = await res.text();
      return errorResponse(`Anthropic request failed [${res.status}]: ${body}`, started);
    }

    const data = await res.json();
    const text: string = Array.isArray(data?.content)
      ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n")
      : "";

    return {
      text,
      citations: extractCitations(text),
      raw: { model, stop_reason: data?.stop_reason },
      promptTokens: data?.usage?.input_tokens,
      outputTokens: data?.usage?.output_tokens,
      latencyMs: Date.now() - started,
      status: text.trim() ? "ok" : "filtered",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResponse(message, started, /abort|timeout/i.test(message));
  }
}

async function queryGateway(
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
