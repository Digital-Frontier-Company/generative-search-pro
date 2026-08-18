import { describe, it, expect } from "vitest";
import {
  estimateCost,
  normaliseForDedupe,
  validatePanel,
  COST_PER_CALL_USD,
  type PanelPrompt,
} from "../panelValidator";
import { daysToDetect, ICC, MIN_WINDOW_DAYS } from "../power";

const brand = { name: "Acme", aliases: ["Acme Inc"] };

const p = (text: string, prompt_class = "category"): PanelPrompt => ({ text, prompt_class });

const goodPanel: PanelPrompt[] = [
  ...Array.from({ length: 12 }, (_, i) => p(`best crm for team size ${i}`)),
  ...Array.from({ length: 8 }, (_, i) => p(`crm option ${i} vs rival ${i}`, "comparison")),
];

describe("panel validator", () => {
  it("passes a balanced, unbranded panel", () => {
    const result = validatePanel(goodPanel, brand);
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects a panel where more than 20% of prompts name the brand", () => {
    const stuffed = [
      ...goodPanel.slice(0, 10),
      ...Array.from({ length: 6 }, (_, i) => p(`is Acme good for use case ${i}`)),
    ];
    const result = validatePanel(stuffed, brand);
    expect(result.ok).toBe(false);
    expect(result.brandedShare).toBeGreaterThan(0.2);
    expect(result.errors[0].title).toMatch(/name your own brand/);
  });

  it("counts aliases as branded", () => {
    const result = validatePanel(
      [p("what does Acme Inc cost"), p("pricing for Acme Inc plans"), p("crm shortlist")],
      brand,
    );
    expect(result.brandedShare).toBeCloseTo(2 / 3, 5);
  });

  it("catches near-duplicate prompts regardless of word order and punctuation", () => {
    expect(normaliseForDedupe("What is the best CRM tool?")).toBe(
      normaliseForDedupe("the best crm tool, what is"),
    );
    const result = validatePanel(
      [...goodPanel, p("Best CRM for team size 0?"), p("best crm for team size 0")],
      brand,
    );
    expect(result.errors.some((e) => /duplicate/.test(e.title))).toBe(true);
  });

  it("warns when the panel has no comparison prompts", () => {
    const result = validatePanel(
      Array.from({ length: 20 }, (_, i) => p(`category question ${i}`)),
      brand,
    );
    expect(result.warnings.some((w) => /No comparison prompts/.test(w.title))).toBe(true);
  });

  it("errors on a panel too small to break down by class", () => {
    const result = validatePanel([p("one question")], brand);
    expect(result.ok).toBe(false);
  });

  it("ignores inactive prompts", () => {
    const result = validatePanel(
      [...goodPanel, { ...p("is Acme any good"), is_active: false }],
      brand,
    );
    expect(result.activeCount).toBe(goodPanel.length);
    expect(result.ok).toBe(true);
  });
});

describe("cost estimate", () => {
  it("matches the published panel sizing", () => {
    // 160 prompts, 1 model, 7 replicates, 30 days -> ~33,600 calls, ~$400/month
    const est = estimateCost({
      promptCount: 160,
      replicatesPerDay: 7,
      modelCount: 1,
      daysPerMonth: 30,
    });
    expect(est.callsPerMonth).toBe(33_600);
    expect(est.costPerMonthUsd).toBeCloseTo(33_600 * COST_PER_CALL_USD, 5);
    expect(Math.round(est.costPerMonthUsd)).toBe(403);
  });

  it("scales with assistants", () => {
    const est = estimateCost({
      promptCount: 160,
      replicatesPerDay: 7,
      modelCount: 5,
      daysPerMonth: 30,
    });
    expect(est.callsPerMonth).toBe(168_000);
    expect(Math.round(est.costPerMonthUsd)).toBe(2016);
  });

  it("warns when the projection exceeds the budget", () => {
    const cost = estimateCost({
      promptCount: 300,
      replicatesPerDay: 7,
      modelCount: 5,
      daysPerMonth: 30,
    });
    const result = validatePanel(goodPanel, brand, { cost, budgetUsd: 500 });
    expect(result.warnings.some((w) => /exceeds your/.test(w.title))).toBe(true);
  });
});

describe("power calculator", () => {
  it("applies the Kish design effect", () => {
    const result = daysToDetect({
      baseline: 0.2,
      lift: 0.1,
      promptCount: 160,
      replicatesPerDay: 7,
    });
    expect(result.deff).toBeCloseTo(1 + 6 * ICC, 10);
    expect(result.deff).toBeCloseTo(3.1, 10);
    expect(result.effectiveRuns).toBe(Math.ceil(result.naiveRuns * result.deff));
  });

  it("never returns less than the methodology floor", () => {
    const result = daysToDetect({
      baseline: 0.2,
      lift: 0.4,
      promptCount: 300,
      replicatesPerDay: 7,
    });
    expect(result.days).toBeGreaterThanOrEqual(MIN_WINDOW_DAYS);
    expect(result.flooredByMethodology).toBe(true);
  });

  it("flags an unprovable lift instead of quoting a number", () => {
    const result = daysToDetect({
      baseline: 0.2,
      lift: 0.002,
      promptCount: 20,
      replicatesPerDay: 2,
    });
    expect(result.impractical).toBe(true);
    expect(result.summary).toMatch(/not provable/);
  });

  it("needs more days for a smaller lift", () => {
    const big = daysToDetect({ baseline: 0.2, lift: 0.15, promptCount: 40, replicatesPerDay: 3 });
    const small = daysToDetect({ baseline: 0.2, lift: 0.05, promptCount: 40, replicatesPerDay: 3 });
    expect(small.rawDays).toBeGreaterThan(big.rawDays);
  });
});
