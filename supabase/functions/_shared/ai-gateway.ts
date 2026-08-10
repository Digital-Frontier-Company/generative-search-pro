// @ts-ignore -- Deno npm import
import { createOpenAICompatible } from "npm:@ai-sdk/openai-compatible@1";

declare const Deno: any;

/** AI SDK provider bound to the Lovable AI Gateway. */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}

export function gatewayKey(): string | null {
  return Deno.env.get("LOVABLE_API_KEY") || null;
}
