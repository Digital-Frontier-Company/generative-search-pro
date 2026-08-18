/**
 * Panel validation and cost projection.
 *
 * Two failure modes kill a measurement programme before it starts: a panel
 * stuffed with the client's own brand name (which inflates answer share into a
 * number that describes nothing), and a panel size nobody costed until the
 * first invoice. Both are cheap to catch here and expensive to catch later.
 */

/** Blended price of one web-grounded assistant call. */
export const COST_PER_CALL_USD = 0.012;

/** Above this share of branded prompts the panel measures the client's own name. */
export const MAX_BRANDED_SHARE = 0.2;

/** Fewer prompts than this and per-class breakdowns have no cells worth reading. */
export const MIN_PROMPTS = 20;

/** Methodology floor: a window shorter than this is not reportable. */
export const MIN_WINDOW_DAYS = 14;

export interface PanelPrompt {
  id?: string;
  text: string;
  prompt_class: string;
  intent_stage?: string;
  is_active?: boolean;
}

export interface PanelBrandContext {
  name: string;
  aliases?: string[];
}

export type IssueLevel = "error" | "warning";

export interface PanelIssue {
  level: IssueLevel;
  title: string;
  detail: string;
  /** Prompt texts the issue points at, when it is prompt-specific. */
  examples?: string[];
}

export interface CostInputs {
  promptCount: number;
  replicatesPerDay: number;
  modelCount: number;
  daysPerMonth: number;
}

export interface CostEstimate {
  callsPerDay: number;
  callsPerMonth: number;
  costPerMonthUsd: number;
  costPerDayUsd: number;
  /** Runs per prompt per day — the sampling adequacy input. */
  runsPerPromptDay: number;
}

/** Normalise for near-duplicate detection: lowercase, strip punctuation and stopwords. */
const STOPWORDS = new Set([
  "the", "a", "an", "for", "of", "to", "in", "is", "are", "what", "which",
  "best", "and", "or", "my", "me", "i", "you", "your", "with", "on", "at",
]);

export function normaliseForDedupe(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .sort()
    .join(" ");
}

function mentionsBrand(text: string, brand: PanelBrandContext): boolean {
  const needles = [brand.name, ...(brand.aliases ?? [])].filter(Boolean);
  const low = text.toLowerCase();
  return needles.some((n) => {
    const escaped = n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(low);
  });
}

export function estimateCost(input: CostInputs): CostEstimate {
  const callsPerDay =
    Math.max(0, input.promptCount) *
    Math.max(0, input.replicatesPerDay) *
    Math.max(0, input.modelCount);
  const callsPerMonth = callsPerDay * Math.max(0, input.daysPerMonth);
  return {
    callsPerDay,
    callsPerMonth,
    costPerDayUsd: callsPerDay * COST_PER_CALL_USD,
    costPerMonthUsd: callsPerMonth * COST_PER_CALL_USD,
    runsPerPromptDay: input.replicatesPerDay * input.modelCount,
  };
}

export interface ValidationResult {
  issues: PanelIssue[];
  /** Hard failures — sampling should not start. */
  errors: PanelIssue[];
  warnings: PanelIssue[];
  brandedShare: number;
  classCounts: Record<string, number>;
  activeCount: number;
  ok: boolean;
}

export function validatePanel(
  prompts: PanelPrompt[],
  brand: PanelBrandContext,
  opts: { budgetUsd?: number; cost?: CostEstimate } = {},
): ValidationResult {
  const active = prompts.filter((p) => p.is_active !== false);
  const issues: PanelIssue[] = [];

  // --- Branded saturation -------------------------------------------------
  const branded = active.filter(
    (p) => p.prompt_class === "branded" || mentionsBrand(p.text, brand),
  );
  const brandedShare = active.length ? branded.length / active.length : 0;
  if (brandedShare > MAX_BRANDED_SHARE) {
    issues.push({
      level: "error",
      title: `${(brandedShare * 100).toFixed(0)}% of prompts name your own brand`,
      detail:
        `Above ${MAX_BRANDED_SHARE * 100}% the score mostly measures whether the model can ` +
        `repeat a name it was just given. Answer share stops being comparable to competitors. ` +
        `Replace branded prompts with category and comparison questions a buyer would actually ask.`,
      examples: branded.slice(0, 5).map((p) => p.text),
    });
  }

  // --- Duplicates ---------------------------------------------------------
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const p of active) {
    const key = normaliseForDedupe(p.text);
    if (!key) continue;
    if (seen.has(key)) dupes.push(p.text);
    else seen.set(key, p.text);
  }
  if (dupes.length) {
    issues.push({
      level: "error",
      title: `${dupes.length} duplicate or near-duplicate prompt${dupes.length > 1 ? "s" : ""}`,
      detail:
        "Duplicates do not add coverage — they add correlated replicates that make the panel " +
        "look better sampled than it is, and they cost the same per call. Remove them.",
      examples: dupes.slice(0, 5),
    });
  }

  // --- Size ---------------------------------------------------------------
  if (active.length < MIN_PROMPTS) {
    issues.push({
      level: active.length < 8 ? "error" : "warning",
      title: `Only ${active.length} active prompt${active.length === 1 ? "" : "s"}`,
      detail:
        `Below ${MIN_PROMPTS} prompts the per-class breakdown has cells with two or three runs ` +
        `in them, and confidence intervals swamp any difference you would want to act on.`,
    });
  }

  // --- Class balance ------------------------------------------------------
  const classCounts: Record<string, number> = {};
  for (const p of active) classCounts[p.prompt_class] = (classCounts[p.prompt_class] ?? 0) + 1;
  const nonBrandedClasses = Object.entries(classCounts).filter(([c]) => c !== "branded");
  if (active.length >= 8) {
    const dominant = nonBrandedClasses.sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] / active.length > 0.7) {
      issues.push({
        level: "warning",
        title: `${(dominant[1] / active.length * 100).toFixed(0)}% of prompts are "${dominant[0]}"`,
        detail:
          "A single-class panel can only tell you about one buying stage. Comparison prompts are " +
          "where competitive gaps show up; category prompts are where discovery does. Spread the mix.",
      });
    }
    if (!classCounts["comparison"]) {
      issues.push({
        level: "warning",
        title: "No comparison prompts",
        detail:
          "Comparison prompts (\"X vs Y\", \"alternatives to …\") are the class where a competitor " +
          "teardown produces actionable placement and representation gaps. Without them the panel " +
          "cannot answer why you lose.",
      });
    }
  }

  // --- Budget -------------------------------------------------------------
  if (opts.cost && opts.budgetUsd && opts.cost.costPerMonthUsd > opts.budgetUsd) {
    issues.push({
      level: "warning",
      title: `Projected $${opts.cost.costPerMonthUsd.toFixed(0)}/month exceeds your $${opts.budgetUsd.toFixed(0)} budget`,
      detail:
        "Cut assistants or sampling days before cutting prompts — panel breadth is what makes the " +
        "score meaningful, while a model or a few days of coverage only widens the interval.",
    });
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  return {
    issues,
    errors,
    warnings,
    brandedShare,
    classCounts,
    activeCount: active.length,
    ok: errors.length === 0 && active.length > 0,
  };
}
