/**
 * How long until a change is provable.
 *
 * The naive calculation treats every run as an independent observation and
 * answers "one day" for a lift the methodology says needs a fortnight. Replicates
 * of the SAME prompt are correlated: the model's answer to one question is far
 * more similar to itself across replicates than to its answer to another
 * question. Kish's design effect corrects for that clustering.
 *
 *   DEFF = 1 + (m - 1) * ICC        m = replicates per prompt per day
 *
 * At ICC 0.35 and 7 replicates, DEFF = 3.1 — the honest answer is three times
 * the naive one. A floor at the methodology minimum window catches the rest.
 */

/** Intra-cluster correlation between replicates of the same prompt. */
export const ICC = 0.35;

/** Methodology minimum reporting window, in days. */
export const MIN_WINDOW_DAYS = 14;

const Z_ALPHA = 1.959963985; // two-sided 95%
const Z_BETA = 0.8416212336; // 80% power

export interface PowerInputs {
  /** Current answer share, 0-1. */
  baseline: number;
  /** Absolute lift to detect, in proportion points (0.10 = 10 percentage points). */
  lift: number;
  /** Prompts in the panel. */
  promptCount: number;
  /** Replicates per prompt per day (replicates x models). */
  replicatesPerDay: number;
}

export interface PowerResult {
  /** Independent runs the naive calculation would ask for. */
  naiveRuns: number;
  /** Design effect applied. */
  deff: number;
  /** Effective runs required once clustering is accounted for. */
  effectiveRuns: number;
  runsPerDay: number;
  /** Days required by the maths, before the floor. */
  rawDays: number;
  /** Days to actually run — never below the methodology floor. */
  days: number;
  flooredByMethodology: boolean;
  /** True when the ask is not reachable in a sane window. */
  impractical: boolean;
  summary: string;
  advice: string[];
}

export function daysToDetect(input: PowerInputs): PowerResult {
  const p1 = Math.min(0.999, Math.max(0.001, input.baseline));
  const p2 = Math.min(0.999, Math.max(0.001, input.baseline + input.lift));
  const pBar = (p1 + p2) / 2;
  const delta = Math.abs(p2 - p1);

  const deff = 1 + (Math.max(1, input.replicatesPerDay) - 1) * ICC;
  const runsPerDay = Math.max(1, input.promptCount) * Math.max(1, input.replicatesPerDay);

  let naiveRuns: number;
  if (delta <= 0) {
    naiveRuns = Infinity;
  } else {
    // Two-proportion comparison, per arm.
    const numerator =
      Z_ALPHA * Math.sqrt(2 * pBar * (1 - pBar)) +
      Z_BETA * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
    naiveRuns = Math.ceil((numerator * numerator) / (delta * delta));
  }

  const effectiveRuns = Number.isFinite(naiveRuns) ? Math.ceil(naiveRuns * deff) : Infinity;
  const rawDays = Number.isFinite(effectiveRuns) ? Math.ceil(effectiveRuns / runsPerDay) : Infinity;
  const days = Number.isFinite(rawDays) ? Math.max(MIN_WINDOW_DAYS, rawDays) : Infinity;
  const impractical = !Number.isFinite(days) || days > 120;

  const advice: string[] = [];
  if (impractical) {
    advice.push(
      "This lift is too small to prove at this sampling rate. Either target a bigger change or accept a directional read.",
    );
  }
  if (Number.isFinite(rawDays) && rawDays > MIN_WINDOW_DAYS) {
    advice.push(
      `Adding prompts shortens this faster than adding replicates: each extra prompt is a fresh cluster, while each extra replicate is discounted ${deff.toFixed(1)}x by correlation.`,
    );
  }
  if (days === MIN_WINDOW_DAYS && rawDays < MIN_WINDOW_DAYS) {
    advice.push(
      `The maths says ${rawDays} day${rawDays === 1 ? "" : "s"}, but the methodology floor is ${MIN_WINDOW_DAYS} — a shorter window cannot separate a real change from a weekday effect.`,
    );
  }
  if (input.replicatesPerDay >= 5) {
    advice.push(
      `At ${input.replicatesPerDay} runs per prompt per day the clustering correction is ${deff.toFixed(1)}x. Past this point more replicates buy very little.`,
    );
  }

  const summary = impractical
    ? `A ${(input.lift * 100).toFixed(0)}-point gain is not provable at this sampling rate within a sensible window.`
    : `To prove a ${(input.lift * 100).toFixed(0)}-point gain at this sampling rate, run for at least ${days} days.`;

  return {
    naiveRuns,
    deff,
    effectiveRuns,
    runsPerDay,
    rawDays,
    days,
    flooredByMethodology: Number.isFinite(rawDays) && rawDays < MIN_WINDOW_DAYS,
    impractical,
    summary,
    advice,
  };
}
