// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore -- Deno npm import
import { generateText, Output } from "npm:ai@5";
// @ts-ignore -- Deno npm import
import { z } from "npm:zod@3";
import { corsHeaders, errorResponse, json, readBody, getUserId } from "../_shared/http.ts";
import { createLovableAiGatewayProvider, gatewayKey } from "../_shared/ai-gateway.ts";

const schema = z.object({
  title: z.string(),
  content: z.string(),
  htmlContent: z.string().optional().default(""),
  seoTitle: z.string().optional().default(""),
  metaDescription: z.string().optional().default(""),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  ctaVariants: z.array(z.string()).default([]),
  headingStructure: z
    .array(z.object({ level: z.number(), text: z.string() }))
    .default([]),
  keywordDensity: z.record(z.number()).default({}),
  schema: z.string().optional().default(""),
  aiOptimizationTips: z.array(z.string()).default([]),
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const prompt: string = (body.prompt || "").toString();
    if (prompt.trim().length < 20) {
      return errorResponse("A content prompt is required", 400);
    }

    const key = gatewayKey();
    if (!key) return errorResponse("AI is not configured for this project", 500);

    const gateway = createLovableAiGatewayProvider(key);
    const result = await generateText({
      model: gateway("google/gemini-3.6-flash"),
      system:
        "You are an expert SEO and generative-engine-optimization writer. Produce original, factual, well-structured content optimised for both search engines and AI answer engines. Never invent statistics or citations.",
      prompt,
      output: Output.object({ schema }),
    });

    const output = await result.output;
    if (!output?.content) {
      return errorResponse("The model returned no content. Please retry.", 502);
    }

    return json(output);
  } catch (e: any) {
    console.error("generate-enhanced-content error", e);
    const status = Number(e?.statusCode || e?.status);
    if (status === 429)
      return errorResponse("AI rate limit reached. Please try again shortly.", 429);
    if (status === 402)
      return errorResponse("AI credits exhausted. Add credits to continue.", 402);
    return errorResponse(e?.message || "Content generation failed", 500);
  }
});
