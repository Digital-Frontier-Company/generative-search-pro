/**
 * Source-graph leverage model.
 *
 * Raw citation counts tell you what is important; leverage tells you what to do
 * on Monday. A domain the client already owns has no upside, and one they
 * cannot realistically enter is context rather than an opportunity — so both
 * get discounted before ranking.
 */

export type Accessibility = "open" | "paid" | "earned" | "closed" | "owned";

export interface RawSourceRow {
  domain: string;
  source_type: string | null;
  accessibility?: string | null;
  citation_count: number;
  distinct_prompts: number;
  distinct_runs?: number;
  share_of_citations: number;
  cumulative_share: number;
  client_present: boolean;
  leverage_rank: number;
}

export interface SourceNode extends RawSourceRow {
  sourceType: string;
  accessibility: Accessibility;
  leverage: number;
  /** Many citations from very few prompts is weak evidence, not a top source. */
  narrow: boolean;
}

const TYPE_PATTERNS: [RegExp, string, Accessibility][] = [
  [/(reddit|quora|stackexchange|stackoverflow|discourse|forum)/, "community", "open"],
  [
    /(g2\.com|capterra|trustpilot|trustradius|yelp|angi\.com|bbb\.org|thumbtack|houzz|glassdoor)/,
    "review_platform",
    "earned",
  ],
  [/(wikipedia|wikidata)/, "documentation", "earned"],
  [/(youtube|vimeo|tiktok)/, "video", "open"],
  [/(linkedin|twitter|x\.com|facebook|instagram)/, "social", "open"],
  [/(crunchbase|clutch\.co|goodfirms|yellowpages|manta|chamberofcommerce)/, "directory", "paid"],
  [/(\.gov|\.edu|arxiv|pubmed|scholar\.google)/, "academic", "closed"],
  [/(techcrunch|forbes|reuters|bloomberg|wsj|nytimes|businessinsider|cnbc)/, "news", "earned"],
  [/(docs\.|documentation|readthedocs|developer\.)/, "documentation", "closed"],
];

export const ACCESSIBILITY_WEIGHT: Record<Accessibility, number> = {
  open: 1.0, // can act this week
  paid: 0.85, // a form and a fee
  earned: 0.6, // sustained work
  closed: 0.1, // effectively unreachable
  owned: 0.05, // already theirs, no upside
};

export const PLAYBOOK: Record<string, string> = {
  directory: "Claim or create the listing, complete every field, add categories.",
  review_platform: "Claim the profile, then generate reviews on a steady cadence.",
  listicle: "Outreach to the publisher with a specific, verifiable reason to include the brand.",
  community:
    "Participate honestly over time. Do not astroturf — it is detectable and burns the domain permanently.",
  news: "PR angle or original data the outlet would want to cite.",
  social: "Maintain an active, complete, consistent profile.",
  video: "Publish content answering the category's top questions; transcripts get retrieved.",
  documentation: "Ensure factual, well-sourced entries exist where the brand is in scope.",
  academic: "Rarely directly actionable — signals the model wants authoritative depth.",
  vendor_site: "Competitor-owned. Counter with your own comparison content.",
  other: "Investigate manually; classification uncertain.",
};

function classify(domain: string): { sourceType: string; accessibility: Accessibility } {
  const d = domain.toLowerCase();
  for (const [pattern, sourceType, accessibility] of TYPE_PATTERNS) {
    if (pattern.test(d)) return { sourceType, accessibility };
  }
  if (/(best|top|vs|versus|alternatives|comparison|review|guide)/i.test(d)) {
    return { sourceType: "listicle", accessibility: "earned" };
  }
  return { sourceType: "other", accessibility: "earned" };
}

export function buildSourceNodes(rows: RawSourceRow[]): SourceNode[] {
  return rows.map((r) => {
    const guessed = classify(r.domain);
    const sourceType = r.source_type || guessed.sourceType;
    const accessibility: Accessibility = r.client_present
      ? "owned"
      : ((r.accessibility as Accessibility) || guessed.accessibility);
    const share = Number(r.share_of_citations) || 0;
    return {
      ...r,
      sourceType,
      accessibility,
      leverage: share * (r.client_present ? 0 : 1) * (ACCESSIBILITY_WEIGHT[accessibility] ?? 0.5),
      narrow: r.distinct_prompts > 0 && r.citation_count / r.distinct_prompts > 8,
    };
  });
}

export interface ConcentrationStats {
  totalDomains: number;
  domainsFor50: number;
  domainsFor80: number;
  clientShare: number;
  clientInHead: number;
  reachableTargets: number;
  read: string;
}

export function concentrationStats(nodes: SourceNode[]): ConcentrationStats {
  const ordered = [...nodes].sort((a, b) => a.leverage_rank - b.leverage_rank);
  const at = (t: number) =>
    ordered.find((n) => Number(n.cumulative_share) >= t)?.leverage_rank ?? ordered.length;
  const d50 = at(0.5);
  const d80 = at(0.8);
  const head = ordered.slice(0, d80);

  const read =
    d80 <= 25
      ? "Highly concentrated. A finite list of placements can move the number materially."
      : d80 <= 80
        ? "Moderately concentrated. Targeted placement works, but must be paired with broad entity presence."
        : "Diffuse authority. No small set of placements will move this — the play is entity consistency, original data and PR.";

  return {
    totalDomains: ordered.length,
    domainsFor50: d50,
    domainsFor80: d80,
    clientShare: ordered.filter((n) => n.client_present).reduce((s, n) => s + Number(n.share_of_citations), 0),
    clientInHead: head.filter((n) => n.client_present).length,
    reachableTargets: head.filter((n) => !n.client_present && n.accessibility !== "closed").length,
    read,
  };
}

export type Horizon = "This month" | "This quarter" | "This year";

export function targetsByHorizon(nodes: SourceNode[]): Record<Horizon, SourceNode[]> {
  const out: Record<Horizon, SourceNode[]> = {
    "This month": [],
    "This quarter": [],
    "This year": [],
  };
  const targets = [...nodes]
    .filter((n) => !n.client_present && n.accessibility !== "closed")
    .sort((a, b) => b.leverage - a.leverage)
    .slice(0, 40);

  for (const n of targets) {
    if (n.sourceType === "directory" || n.accessibility === "paid") out["This month"].push(n);
    else if (["review_platform", "listicle", "community", "social", "video"].includes(n.sourceType))
      out["This quarter"].push(n);
    else out["This year"].push(n);
  }
  return out;
}
