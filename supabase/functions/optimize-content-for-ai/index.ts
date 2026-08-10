// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore -- Deno npm import
import { generateText } from "npm:ai@5";
import { corsHeaders, errorResponse, json, readBody, getUserId } from "../_shared/http.ts";
import { createLovableAiGatewayProvider, gatewayKey } from "../_shared/ai-gateway.ts";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function heuristics(content: string, keywords: string[]) {
  const words = (content.match(/\S+/g) || []).length;
  const headings = (content.match(/^#{1,6}\s+.+$/gm) || []).length;
  const questions = (content.match(/^#{1,6}\s+.*\?\s*$/gm) || []).length;
  const bullets = (content.match(/^\s*[-*+]\s+/gm) || []).length;
  const paragraphs = content.split(/\n{2,}/).filter((p) => p.trim().length > 40);
  const longParagraphs = paragraphs.filter((p) => p.split(/\s+/).length > 120).length;
  const hasFaq = /frequently asked questions|^#{1,6}\s*faq/im.test(content);
  const hasNumbers = /\b\d+(\.\d+)?%?\b/.test(content);
  const keywordHits = keywords.filter((k) =>
    k && content.toLowerCase().includes(k.toLowerCase()),
  );

  const score = clamp(
    Math.min(20, words / 40) +
      Math.min(15, headings * 3) +
      Math.min(15, questions * 5) +
      Math.min(10, bullets * 2) +
      (hasFaq ? 12 : 0) +
      (hasNumbers ? 8 : 0) +
      (longParagraphs === 0 ? 10 : 3) +
      (keywords.length ? (keywordHits.length / keywords.length) * 10 : 8),
  );

  const suggestions: string[] = [];
  if (headings < 3) suggestions.push("Add more descriptive H2/H3 headings so AI engines can extract sections.");
  if (questions < 2) suggestions.push("Phrase at least two headings as the exact questions users ask.");
  if (!hasFaq) suggestions.push("Add an FAQ section with short, self-contained answers (40-60 words each).");
  if (bullets < 3) suggestions.push("Convert dense explanations into bullet or numbered lists.");
  if (longParagraphs) suggestions.push(`Split ${longParagraphs} long paragraph(s) — keep them under 120 words.`);
  if (!hasNumbers) suggestions.push("Include concrete statistics or figures; AI answers favour citable specifics.");
  if (keywords.length && keywordHits.length < keywords.length)
    suggestions.push(
      `Cover missing target terms naturally: ${keywords
        .filter((k) => !keywordHits.includes(k))
        .join(", ")}.`,
    );
  if (words < 400) suggestions.push("Expand the piece — under 400 words rarely gets cited as a source.");
  suggestions.push("Open with a 2-3 sentence direct answer before the supporting detail.");

  return { score, suggestions };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const content: string = (body.content || "").toString();
    const keywords: string[] = Array.isArray(body.keywords)
      ? body.keywords.filter(Boolean).map(String)
      : [];

    if (content.trim().length < 40) {
      return errorResponse("Provide at least 40 characters of content to optimize", 400);
    }
    if (content.length > 60000) {
      return errorResponse("Content is too long (max 60,000 characters)", 400);
    }

    const base = heuristics(content, keywords);
    let optimizedContent = content;
    let suggestions = base.suggestions;

    const key = gatewayKey();
    if (key) {
      try {
        const gateway = createLovableAiGatewayProvider(key);
        const result = await generateText({
          model: gateway("google/gemini-3.6-flash"),
          system:
            "You rewrite content for generative search visibility (AEO/GEO). Preserve meaning and voice. Structure for AI extraction: a direct answer up front, question-style H2s, short scannable paragraphs, bullet lists, and a FAQ section. Never invent facts or statistics. Return markdown only.",
          prompt: `Target keywords: ${keywords.join(", ") || "(none specified)"}\n\nRewrite the following content for maximum AI-engine citability:\n\n${content}`,
        });
        // Stream-safe: generateText awaits the full text.
        if (result.text && result.text.trim().length > 50) {
          optimizedContent = result.text.trim();
          const after = heuristics(optimizedContent, keywords);
          suggestions = after.suggestions.slice(0, 5);
          return json({
            optimizedContent,
            suggestions,
            aiReadinessScore: after.score,
            originalScore: base.score,
            optimized: true,
          });
        }
      } catch (e) {
        console.error("AI optimization failed, falling back to heuristics", e);
      }
    }

    return json({
      optimizedContent,
      suggestions,
      aiReadinessScore: base.score,
      originalScore: base.score,
      optimized: false,
    });
  } catch (e) {
    console.error("optimize-content-for-ai error", e);
    return errorResponse((e as Error).message || "Optimization failed", 500);
  }
});
