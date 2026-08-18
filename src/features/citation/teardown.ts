/**
 * Competitor answer teardown.
 *
 * Partition runs by who was mentioned, then diff the cited source sets so a
 * PLACEMENT gap (they get cited somewhere we never appear) is never confused
 * with a REPRESENTATION gap (we both appear on the page and the model still
 * prefers them). Chasing new placements when the real problem is a weak profile
 * on a page you already sit on burns a quarter and moves nothing.
 */

export const MIN_RUNS_SOURCE = 8;
const Z95 = 1.959963985;

export function wilson(successes: number, trials: number, z = Z95) {
  if (trials <= 0) return { point: 0, low: 0, high: 1 };
  const p = successes / trials;
  const denom = 1 + (z * z) / trials;
  const centre = (p + (z * z) / (2 * trials)) / denom;
  const margin =
    (z / denom) * Math.sqrt((p * (1 - p)) / trials + (z * z) / (4 * trials * trials));
  return { point: p, low: Math.max(0, centre - margin), high: Math.min(1, centre + margin) };
}

export interface TeardownInput {
  /** run_id -> set of brand names mentioned */
  mentionsByRun: Map<string, Set<string>>;
  /** run_id -> cited domains (one entry per citation) */
  citesByRun: Map<string, string[]>;
  /** run_id -> prompt_class */
  runClass: Map<string, string>;
  /** (run_id, brand) -> position / endorsement */
  positions: Map<string, number>;
  endorsed: Map<string, boolean>;
  nDays: number;
  nPrompts: number;
}

export interface DomainDelta {
  domain: string;
  theirsPerRun: number;
  oursPerRun: number;
  theirsRaw: number;
  oursRaw: number;
}

export interface TeardownReport {
  totalRuns: number;
  partition: { W: number; L: number; B: number; N: number };
  client: { hits: number; point: number; low: number; high: number };
  competitor: { hits: number; point: number; low: number; high: number };
  overlap: boolean;
  leader: string | null;
  gapPoints: number;
  runsPerPromptDay: number;
  belowFloor: boolean;
  byClass: { promptClass: string; W: number; L: number; B: number; N: number; net: number }[];
  worstClass: string | null;
  placementGaps: DomainDelta[];
  representationGaps: DomainDelta[];
  owned: DomainDelta[];
  neitherSources: { domain: string; count: number }[];
  position: {
    bothRuns: number;
    clientMean: number;
    competitorMean: number;
    clientEndorsed: number;
    competitorEndorsed: number;
    orderingProblem: boolean;
  } | null;
}

const key = (runId: string, brand: string) => `${runId}::${brand.toLowerCase()}`;

function countDomains(citesByRun: Map<string, string[]>, runs: Set<string>) {
  const counts = new Map<string, number>();
  runs.forEach((r) => {
    for (const d of citesByRun.get(r) ?? []) counts.set(d, (counts.get(d) ?? 0) + 1);
  });
  return counts;
}

export function buildTeardown(
  input: TeardownInput,
  client: string,
  competitor: string,
): TeardownReport {
  const cl = client.toLowerCase();
  const co = competitor.toLowerCase();
  const W = new Set<string>(); // competitor only
  const L = new Set<string>(); // client only
  const B = new Set<string>(); // both
  const N = new Set<string>(); // neither

  input.mentionsByRun.forEach((brands, runId) => {
    const low = new Set(Array.from(brands, (b) => b.toLowerCase()));
    const hasC = low.has(cl);
    const hasX = low.has(co);
    if (hasX && !hasC) W.add(runId);
    else if (hasC && !hasX) L.add(runId);
    else if (hasC && hasX) B.add(runId);
    else N.add(runId);
  });

  const totalRuns = W.size + L.size + B.size + N.size;
  const cHits = L.size + B.size;
  const xHits = W.size + B.size;
  const c = wilson(cHits, totalRuns);
  const x = wilson(xHits, totalRuns);
  const overlap = c.low <= x.high && x.low <= c.high;

  const classMap = new Map<string, { W: number; L: number; B: number; N: number }>();
  const bump = (runs: Set<string>, k: "W" | "L" | "B" | "N") =>
    runs.forEach((r) => {
      const cls = input.runClass.get(r) ?? "unknown";
      const row = classMap.get(cls) ?? { W: 0, L: 0, B: 0, N: 0 };
      row[k] += 1;
      classMap.set(cls, row);
    });
  bump(W, "W");
  bump(L, "L");
  bump(B, "B");
  bump(N, "N");

  const byClass = Array.from(classMap, ([promptClass, v]) => ({
    promptClass,
    ...v,
    net: v.L - v.W,
  })).sort((a, b) => a.net - b.net);

  const wc = countDomains(input.citesByRun, W);
  const lc = countDomains(input.citesByRun, L);
  const nc = countDomains(input.citesByRun, N);
  const perRun = (raw: number, n: number) => (n ? raw / n : 0);

  const placementGaps: DomainDelta[] = [];
  const representationGaps: DomainDelta[] = [];
  wc.forEach((raw, domain) => {
    const oursRaw = lc.get(domain) ?? 0;
    const delta: DomainDelta = {
      domain,
      theirsRaw: raw,
      oursRaw,
      theirsPerRun: perRun(raw, W.size),
      oursPerRun: perRun(oursRaw, L.size),
    };
    if (oursRaw === 0) placementGaps.push(delta);
    else if (delta.theirsPerRun > delta.oursPerRun) representationGaps.push(delta);
  });
  placementGaps.sort((a, b) => b.theirsPerRun - a.theirsPerRun);
  representationGaps.sort(
    (a, b) => b.theirsPerRun - b.oursPerRun - (a.theirsPerRun - a.oursPerRun),
  );

  const owned: DomainDelta[] = [];
  lc.forEach((raw, domain) => {
    if (!wc.has(domain)) {
      owned.push({
        domain,
        theirsRaw: 0,
        oursRaw: raw,
        theirsPerRun: 0,
        oursPerRun: perRun(raw, L.size),
      });
    }
  });
  owned.sort((a, b) => b.oursPerRun - a.oursPerRun);

  const neitherSources = Array.from(nc, ([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  let position: TeardownReport["position"] = null;
  if (B.size && input.positions.size) {
    const cp: number[] = [];
    const xp: number[] = [];
    B.forEach((r) => {
      const a = input.positions.get(key(r, client));
      const b = input.positions.get(key(r, competitor));
      if (a != null) cp.push(a);
      if (b != null) xp.push(b);
    });
    if (cp.length && xp.length) {
      const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
      const clientMean = mean(cp);
      const competitorMean = mean(xp);
      position = {
        bothRuns: B.size,
        clientMean,
        competitorMean,
        clientEndorsed: Array.from(B).filter((r) => input.endorsed.get(key(r, client))).length,
        competitorEndorsed: Array.from(B).filter((r) => input.endorsed.get(key(r, competitor)))
          .length,
        orderingProblem: clientMean > competitorMean + 0.5,
      };
    }
  }

  const runsPerPromptDay =
    input.nPrompts && input.nDays ? totalRuns / (input.nPrompts * input.nDays) : 0;

  return {
    totalRuns,
    partition: { W: W.size, L: L.size, B: B.size, N: N.size },
    client: { hits: cHits, ...c },
    competitor: { hits: xHits, ...x },
    overlap,
    leader: overlap ? null : x.point > c.point ? competitor : client,
    gapPoints: Math.abs(x.point - c.point) * 100,
    runsPerPromptDay,
    belowFloor: runsPerPromptDay > 0 && runsPerPromptDay < MIN_RUNS_SOURCE,
    byClass,
    worstClass: byClass.length && byClass[0].net < 0 ? byClass[0].promptClass : null,
    placementGaps: placementGaps.slice(0, 20),
    representationGaps: representationGaps.slice(0, 15),
    owned: owned.slice(0, 12),
    neitherSources,
    position,
  };
}

export const mentionKey = key;
