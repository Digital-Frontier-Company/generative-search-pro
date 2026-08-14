import { supabase } from "@/integrations/supabase/client";
import type { AeoBrand, AeoPanel } from "./useAeoWorkspace";

export interface DefaultPromptSeed {
  text: string;
  intent_stage: string;
  prompt_class: string;
  tags: string[];
}

const cleanLabel = (brand: Pick<AeoBrand, "name" | "domain">) =>
  brand.name?.trim() || (brand.domain ?? "").replace(/^https?:\/\//, "").replace(/^www\./, "");

/**
 * A minimal but methodologically balanced starter panel: awareness → decision,
 * covering category, problem, comparison and brand prompt classes so the first
 * sampling run produces usable answer-share signal.
 */
export function buildDefaultPrompts(brand: Pick<AeoBrand, "name" | "domain">): DefaultPromptSeed[] {
  const label = cleanLabel(brand) || "this brand";
  const site = (brand.domain ?? "").replace(/^https?:\/\//, "").replace(/^www\./, "");
  const topic = site || label;

  return [
    {
      text: `What are the best tools or providers for what ${label} does?`,
      intent_stage: "awareness",
      prompt_class: "category",
      tags: ["starter"],
    },
    {
      text: `How do I choose a solution like ${label}? What should I look for?`,
      intent_stage: "awareness",
      prompt_class: "problem",
      tags: ["starter"],
    },
    {
      text: `Top alternatives to ${label} in 2026, with pros and cons.`,
      intent_stage: "consideration",
      prompt_class: "comparison",
      tags: ["starter"],
    },
    {
      text: `Compare the leading options in ${label}'s category by pricing and features.`,
      intent_stage: "consideration",
      prompt_class: "comparison",
      tags: ["starter"],
    },
    {
      text: `Is ${label} (${topic}) a good choice? What do reviews say?`,
      intent_stage: "decision",
      prompt_class: "brand",
      tags: ["starter"],
    },
    {
      text: `Which provider should I pick for the problem ${label} solves, and why?`,
      intent_stage: "decision",
      prompt_class: "category",
      tags: ["starter"],
    },
  ];
}

/**
 * Ensures the brand has an active panel with at least one active prompt.
 * Creates the panel and/or seeds the default starter prompts when missing.
 * Returns the panel id and how many prompts were created.
 */
export async function ensurePanelWithPrompts(params: {
  accountId: string;
  brand: AeoBrand;
  existingPanels: AeoPanel[];
}): Promise<{ panelId: string; createdPanel: boolean; createdPrompts: number }> {
  const { accountId, brand, existingPanels } = params;
  const brandPanels = existingPanels.filter((p) => p.brand_id === brand.id);
  let panel = brandPanels.find((p) => p.status === "active") ?? brandPanels[0] ?? null;
  let createdPanel = false;

  if (!panel) {
    const version = brandPanels.length ? Math.max(...brandPanels.map((p) => p.version)) + 1 : 1;
    const { data, error } = await supabase
      .from("prompt_panels")
      .insert({
        account_id: accountId,
        brand_id: brand.id,
        version,
        status: "active",
        rationale: "Auto-created starter panel",
      })
      .select("*")
      .single();
    if (error) throw error;
    panel = data as AeoPanel;
    createdPanel = true;
  }

  const { count, error: countError } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("panel_id", panel.id)
    .eq("is_active", true);
  if (countError) throw countError;
  if ((count ?? 0) > 0) return { panelId: panel.id, createdPanel, createdPrompts: 0 };

  const seeds = buildDefaultPrompts(brand).map((seed) => ({ ...seed, panel_id: panel!.id, is_active: true }));
  const { error: insertError } = await supabase.from("prompts").insert(seeds);
  if (insertError) throw insertError;

  return { panelId: panel.id, createdPanel, createdPrompts: seeds.length };
}
