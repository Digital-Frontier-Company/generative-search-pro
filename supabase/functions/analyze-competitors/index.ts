// @ts-ignore -- Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  errorResponse,
  json,
  readBody,
  getUserId,
  cleanDomain,
} from "../_shared/http.ts";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function textOf(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function profile(domain: string) {
  const url = `https://${domain}/`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GenerativeSearchProBot/1.0" },
      redirect: "follow",
    });
    const html = await res.text();
    const ttfb = Date.now() - t0;
    const body = textOf(html);
    const headings = Array.from(html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)).map(
      (m) => ({ level: Number(m[1]), text: textOf(m[2]) }),
    );
    const schemaTypes = Array.from(
      new Set(
        (html.match(/"@type"\s*:\s*"([^"]+)"/gi) || []).map((s) =>
          s.replace(/.*"@type"\s*:\s*"/i, "").replace(/"$/, ""),
        ),
      ),
    );
    const wordCount = (body.match(/\S+/g) || []).length;
    const questionHeadings = headings.filter((h) => /\?|^(what|how|why|when|who)\b/i.test(h.text)).length;
    const lists = (html.match(/<(ul|ol)\b/gi) || []).length;
    const hasFaq = schemaTypes.includes("FAQPage") || /frequently asked questions/i.test(body);
    const aiVisibilityScore = clamp(
      Math.min(30, wordCount / 30) +
        (schemaTypes.length ? 18 : 0) +
        (hasFaq ? 14 : 0) +
        Math.min(12, questionHeadings * 4) +
        Math.min(10, lists * 2) +
        (ttfb < 600 ? 16 : 8),
    );
    return {
      domain,
      reachable: true,
      wordCount,
      headings,
      topics: headings.slice(0, 20).map((h) => h.text).filter(Boolean),
      schemaTypes,
      questionHeadings,
      lists,
      hasFaq,
      ttfb,
      aiVisibilityScore,
      body,
    };
  } catch (_e) {
    return {
      domain,
      reachable: false,
      wordCount: 0,
      headings: [] as any[],
      topics: [] as string[],
      schemaTypes: [] as string[],
      questionHeadings: 0,
      lists: 0,
      hasFaq: false,
      ttfb: 0,
      aiVisibilityScore: 0,
      body: "",
    };
  }
}

function terms(text: string): Set<string> {
  const stop = new Set(
    "the a an and or but of to in for on with is are was were be this that it as at by from your you we our their they what how why when where can will more most other some such no not only own same than then".split(
      " ",
    ),
  );
  return new Set(
    (text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) || []).filter((w) => !stop.has(w)),
  );
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const userId = await getUserId(req);
    if (!userId) return errorResponse("Authentication required", 401);

    const body = await readBody(req);
    const topic: string = (body.topic || body.user_domain || "").toString().trim();
    const rawCompetitors: string[] = Array.isArray(body.competitors)
      ? body.competitors
      : Array.isArray(body.competitor_domains)
      ? body.competitor_domains
      : [];
    const competitors = rawCompetitors
      .map((c) => cleanDomain(c))
      .filter((c) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(c))
      .slice(0, 5);

    if (!competitors.length) {
      return errorResponse("At least one competitor domain is required", 400);
    }

    const ownDomain = cleanDomain(body.domain || body.user_domain || "");
    const [own, ...profiles] = await Promise.all([
      ownDomain ? profile(ownDomain) : Promise.resolve(null as any),
      ...competitors.map((c) => profile(c)),
    ]);

    const reachable = profiles.filter((p) => p.reachable);
    if (!reachable.length) {
      return errorResponse("None of the competitor domains could be reached", 502);
    }

    const ownTerms = own?.reachable ? terms(own.body) : new Set<string>();

    const topCompetitors = reachable.map((p) => {
      const strengths: string[] = [];
      const weaknesses: string[] = [];
      if (p.schemaTypes.length) strengths.push(`Structured data (${p.schemaTypes.slice(0, 3).join(", ")})`);
      else weaknesses.push("No structured data");
      if (p.hasFaq) strengths.push("FAQ / Q&A content");
      else weaknesses.push("No FAQ content");
      if (p.wordCount > 800) strengths.push(`In-depth content (${p.wordCount} words)`);
      else weaknesses.push(`Thin content (${p.wordCount} words)`);
      if (p.ttfb < 600) strengths.push(`Fast response (${p.ttfb}ms)`);
      else weaknesses.push(`Slow response (${p.ttfb}ms)`);
      if (p.questionHeadings) strengths.push(`${p.questionHeadings} question-style headings`);

      const theirTerms = Array.from(terms(p.body));
      const gapTerms = theirTerms.filter((t) => !ownTerms.has(t)).slice(0, 12);

      return {
        domain: p.domain,
        aiVisibilityScore: p.aiVisibilityScore,
        wordCount: p.wordCount,
        schemaTypes: p.schemaTypes,
        strengths,
        weaknesses,
        opportunityGaps: gapTerms,
        topHeadings: p.topics.slice(0, 8),
      };
    });

    // Terms most competitors cover and we don't
    const termCounts = new Map<string, number>();
    for (const p of reachable) {
      for (const t of terms(p.body)) {
        if (ownTerms.size && ownTerms.has(t)) continue;
        termCounts.set(t, (termCounts.get(t) || 0) + 1);
      }
    }
    const sharedGaps = Array.from(termCounts.entries())
      .filter(([, c]) => c >= Math.max(2, Math.ceil(reachable.length / 2)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([t]) => t);

    const gaps: string[] = [];
    if (sharedGaps.length)
      gaps.push(
        `Competitors consistently cover topics you don't: ${sharedGaps.slice(0, 8).join(", ")}`,
      );
    const withFaq = reachable.filter((p) => p.hasFaq).length;
    if (withFaq && !own?.hasFaq)
      gaps.push(`${withFaq}/${reachable.length} competitors publish FAQ content and you do not`);
    const withSchema = reachable.filter((p) => p.schemaTypes.length).length;
    if (withSchema && !(own?.schemaTypes.length))
      gaps.push(`${withSchema}/${reachable.length} competitors use structured data and you do not`);
    const avgWords = Math.round(
      reachable.reduce((a, p) => a + p.wordCount, 0) / reachable.length,
    );
    if (own?.reachable && own.wordCount < avgWords * 0.8)
      gaps.push(
        `Your page has ${own.wordCount} words vs a competitor average of ${avgWords}`,
      );
    if (!gaps.length) gaps.push("No major structural gaps detected against these competitors");

    const opportunities = [
      ...sharedGaps.slice(0, 6).map((t) => `Publish an authoritative answer page covering "${t}"`),
      !own?.hasFaq && withFaq ? "Add an FAQ section with FAQPage schema" : null,
      own?.reachable && own.questionHeadings < 3
        ? "Reframe key headings as the questions users actually ask"
        : null,
      "Target long-tail comparison queries where no competitor ranks strongly",
    ].filter(Boolean) as string[];

    const recommendations = [
      gaps[0] ? `Close the biggest content gap first: ${gaps[0]}` : null,
      withSchema > reachable.length / 2
        ? "Match competitor structured-data coverage (Organization, Article, FAQPage)"
        : "Ship structured data early — most competitors here are weak on it",
      own?.reachable && own.ttfb > Math.min(...reachable.map((p) => p.ttfb))
        ? "Improve time-to-first-byte; the fastest competitor is quicker than you"
        : "Maintain your speed advantage — it feeds AI crawl frequency",
      `Aim for at least ${Math.max(900, avgWords + 200)} words of substantive content on core pages`,
    ].filter(Boolean) as string[];

    return json({
      topic: topic || ownDomain || null,
      user_domain: ownDomain || null,
      own_profile: own?.reachable
        ? {
            domain: own.domain,
            aiVisibilityScore: own.aiVisibilityScore,
            wordCount: own.wordCount,
            schemaTypes: own.schemaTypes,
            hasFaq: own.hasFaq,
          }
        : null,
      topCompetitors,
      marketGaps: sharedGaps,
      gaps,
      opportunities,
      recommendations,
      competitiveAdvantages: own?.reachable
        ? [
            own.aiVisibilityScore >= Math.max(...reachable.map((p) => p.aiVisibilityScore))
              ? "Highest AI visibility score in this set"
              : null,
            own.ttfb <= Math.min(...reachable.map((p) => p.ttfb))
              ? "Fastest server response in this set"
              : null,
            own.wordCount >= avgWords ? "Above-average content depth" : null,
          ].filter(Boolean)
        : [],
      analyzed_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("analyze-competitors error", e);
    return errorResponse((e as Error).message || "Competitor analysis failed", 500);
  }
});
