import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AeoBrand {
  id: string;
  account_id: string;
  name: string;
  domain: string | null;
  is_client: boolean;
  aliases: string[];
}

export interface AeoPanel {
  id: string;
  brand_id: string;
  version: number;
  status: string;
  rationale: string | null;
  generated_at: string;
}

export interface AeoPrompt {
  id: string;
  panel_id: string;
  text: string;
  intent_stage: string;
  prompt_class: string;
  tags: string[];
  is_active: boolean;
}

/**
 * Loads (and bootstraps) the signed-in user's AEO workspace: account, brands,
 * panels. Everything is scoped by RLS to accounts the user belongs to.
 */
export function useAeoWorkspace() {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [brands, setBrands] = useState<AeoBrand[]>([]);
  const [panels, setPanels] = useState<AeoPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setError("You need to be signed in to use AEO measurement.");
        return;
      }

      const { data: account, error: accountError } = await (supabase.rpc as any)(
        "ensure_account",
        { p_name: "My workspace" },
      );
      if (accountError) throw accountError;
      const id = account as string;
      setAccountId(id);

      const [{ data: brandRows, error: brandError }, { data: panelRows, error: panelError }] =
        await Promise.all([
          supabase.from("brands").select("*").eq("account_id", id).order("created_at"),
          supabase.from("prompt_panels").select("*").eq("account_id", id).order("generated_at", {
            ascending: false,
          }),
        ]);
      if (brandError) throw brandError;
      if (panelError) throw panelError;

      setBrands((brandRows ?? []) as AeoBrand[]);
      setPanels((panelRows ?? []) as AeoPanel[]);
    } catch (e: any) {
      setError(e?.message ?? "Could not load your AEO workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { accountId, brands, panels, loading, error, reload: load };
}

export async function fetchPrompts(panelId: string): Promise<AeoPrompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("panel_id", panelId)
    .order("created_at");
  if (error) throw error;
  return (data ?? []) as AeoPrompt[];
}

export const INTENT_STAGES = ["awareness", "consideration", "decision"] as const;
export const PROMPT_CLASSES = ["category", "comparison", "problem", "brand"] as const;
