// ============================================================================
// Mention + citation extraction for the Frontier AEO panel runner
// ============================================================================
// Deterministic, conservative, reproducible. Word-boundary matching avoids
// substring collisions ("Angi" vs "Angina"), aliases are first-class, and a
// dismissal ("unlike SlowHaul...") is counted as a mention but never as an
// endorsement.

export interface BrandSpec {
  id: string;
  name: string;
  aliases: string[];
  domain?: string;
}

export interface MentionResult {
  brandId: string;
  position: number;
  charIndex: number;
  verbatim: string;
  isEndorsed: boolean;
  sentiment: "positive" | "neutral" | "negative" | "mixed";
}

export interface ExtractedCitation {
  url: string;
  domain: string;
  rank: number;
  anchorContext?: string;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matcherFor(brand: BrandSpec): RegExp {
  const variants = [brand.name, ...(brand.aliases ?? [])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex);
  if (brand.domain) variants.push(escapeRegex(brand.domain));
  return new RegExp(`(?<![\\w-])(${variants.join("|")})(?![\\w-])`, "gi");
}

const NEGATIVE_CUES = [
  "unlike", "avoid", "worse than", "poor", "complaints", "unfortunately",
  "downside", "drawback", "not recommended", "less reliable", "expensive",
  "criticized", "lacks", "no longer", "went out of business", "beware",
];

const ENDORSEMENT_CUES = [
  "recommend", "best", "top", "leading", "trusted", "excellent", "great",
  "consider", "strong choice", "reliable", "highly rated", "go-to",
  "well-reviewed", "standout", "preferred",
];

function windowAround(text: string, idx: number, span = 220): string {
  return text.slice(Math.max(0, idx - span), Math.min(text.length, idx + span)).toLowerCase();
}

export function extractMentions(text: string, brands: BrandSpec[]): MentionResult[] {
  if (!text) return [];

  const hits: Array<{ brand: BrandSpec; index: number; verbatim: string }> = [];
  for (const brand of brands) {
    const re = matcherFor(brand);
    const m = re.exec(text);
    if (m) hits.push({ brand, index: m.index, verbatim: m[0] });
  }

  hits.sort((a, b) => a.index - b.index);

  return hits.map((hit, i) => {
    const ctx = windowAround(text, hit.index);
    const neg = NEGATIVE_CUES.filter((c) => ctx.includes(c)).length;
    const pos = ENDORSEMENT_CUES.filter((c) => ctx.includes(c)).length;

    let sentiment: MentionResult["sentiment"] = "neutral";
    if (pos > 0 && neg > 0) sentiment = "mixed";
    else if (pos > 0) sentiment = "positive";
    else if (neg > 0) sentiment = "negative";

    return {
      brandId: hit.brand.id,
      position: i + 1,
      charIndex: hit.index,
      verbatim: hit.verbatim,
      isEndorsed: pos > 0 && neg === 0,
      sentiment,
    };
  });
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

const URL_RE = /https?:\/\/[^\s<>()\[\]"'`]+/gi;

/**
 * Pull cited URLs out of an answer. Models reached through the gateway return
 * their sources inline in prose/markdown rather than in a structured citation
 * field, so the source graph is built from the URLs the answer actually names.
 */
export function extractCitations(text: string): ExtractedCitation[] {
  if (!text) return [];
  const seen = new Set<string>();
  const out: ExtractedCitation[] = [];
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    const url = match[0].replace(/[.,;:)\]]+$/, "");
    const domain = domainOf(url);
    if (!domain || seen.has(url)) continue;
    seen.add(url);
    out.push({
      url: url.slice(0, 2000),
      domain,
      rank: out.length + 1,
      anchorContext: text.slice(Math.max(0, match.index - 120), match.index + 120),
    });
  }
  return out;
}
