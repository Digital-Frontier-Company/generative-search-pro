import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Plus, Trash2, Loader2, ListChecks, Building2 } from "lucide-react";
import { ensurePanelWithPrompts } from "./defaultPrompts";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  INTENT_STAGES,
  PROMPT_CLASSES,
  fetchPrompts,
  useAeoWorkspace,
  type AeoPrompt,
} from "./useAeoWorkspace";

const AEOSetupPage = () => {
  const { accountId, brands, panels, loading, error, reload } = useAeoWorkspace();

  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");
  const [brandAliases, setBrandAliases] = useState("");
  const [isClient, setIsClient] = useState(true);
  const [savingBrand, setSavingBrand] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedPanel, setSelectedPanel] = useState<string>("");
  const [prompts, setPrompts] = useState<AeoPrompt[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const [promptText, setPromptText] = useState("");
  const [intentStage, setIntentStage] = useState<string>("consideration");
  const [promptClass, setPromptClass] = useState<string>("category");
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [seeding, setSeeding] = useState(false);


  useEffect(() => {
    if (!selectedBrand && brands.length) setSelectedBrand(brands[0].id);
  }, [brands, selectedBrand]);

  const brandPanels = panels.filter((p) => p.brand_id === selectedBrand);

  useEffect(() => {
    if (brandPanels.length && !brandPanels.some((p) => p.id === selectedPanel)) {
      setSelectedPanel(brandPanels[0].id);
    }
    if (!brandPanels.length) setSelectedPanel("");
  }, [brandPanels, selectedPanel]);

  useEffect(() => {
    if (!selectedPanel) {
      setPrompts([]);
      return;
    }
    setPromptsLoading(true);
    fetchPrompts(selectedPanel)
      .then(setPrompts)
      .catch((e) => toast.error(e.message))
      .finally(() => setPromptsLoading(false));
  }, [selectedPanel]);

  const addBrand = async () => {
    if (!accountId || !brandName.trim()) return;
    setSavingBrand(true);
    const { error: insertError } = await supabase.from("brands").insert({
      account_id: accountId,
      name: brandName.trim(),
      domain: brandDomain.trim() || null,
      is_client: isClient,
      aliases: brandAliases
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    });
    setSavingBrand(false);
    if (insertError) return toast.error(insertError.message);
    setBrandName("");
    setBrandDomain("");
    setBrandAliases("");
    toast.success("Brand added");
    reload();
  };

  const createPanel = async () => {
    if (!accountId || !selectedBrand) return;
    const version = brandPanels.length ? Math.max(...brandPanels.map((p) => p.version)) + 1 : 1;
    const { data, error: panelError } = await supabase
      .from("prompt_panels")
      .insert({
        account_id: accountId,
        brand_id: selectedBrand,
        version,
        status: "active",
        rationale: "Manually created panel",
      })
      .select("id")
      .single();
    if (panelError) return toast.error(panelError.message);
    toast.success(`Panel v${version} created`);
    setSelectedPanel(data.id);
    reload();
  };

  const seedStarterPrompts = async () => {
    const brand = brands.find((b) => b.id === selectedBrand);
    if (!accountId || !brand) return toast.error("Select a brand first.");
    setSeeding(true);
    try {
      const result = await ensurePanelWithPrompts({ accountId, brand, existingPanels: panels });
      toast.success(`Added ${result.createdPrompts} starter prompts`);
      setSelectedPanel(result.panelId);
      setPrompts(await fetchPrompts(result.panelId));
      reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not create starter prompts.");
    } finally {
      setSeeding(false);
    }
  };

  const addPrompt = async () => {

    if (!selectedPanel || !promptText.trim()) return;
    setSavingPrompt(true);
    const { error: promptError } = await supabase.from("prompts").insert({
      panel_id: selectedPanel,
      text: promptText.trim(),
      intent_stage: intentStage,
      prompt_class: promptClass,
      tags: [],
      is_active: true,
    });
    setSavingPrompt(false);
    if (promptError) return toast.error(promptError.message);
    setPromptText("");
    setPrompts(await fetchPrompts(selectedPanel));
  };

  const togglePrompt = async (prompt: AeoPrompt) => {
    const { error: updateError } = await supabase
      .from("prompts")
      .update({ is_active: !prompt.is_active })
      .eq("id", prompt.id);
    if (updateError) return toast.error(updateError.message);
    setPrompts(await fetchPrompts(selectedPanel));
  };

  const deletePrompt = async (prompt: AeoPrompt) => {
    const { error: deleteError } = await supabase.from("prompts").delete().eq("id", prompt.id);
    if (deleteError) return toast.error(deleteError.message);
    setPrompts(await fetchPrompts(selectedPanel));
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Helmet>
        <title>AEO Panel Setup | Generative Search Pro</title>
        <meta
          name="description"
          content="Set up brands and prompt panels so AI answer visibility can be sampled repeatedly and measured as a probability."
        />
      </Helmet>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">AEO Panel Setup</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Answer visibility is a probability, not a rank. Define the brands you track and the
          prompt panel that gets sampled repeatedly each day.
        </p>
      </header>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-4 w-4 text-primary" /> Brands
          </CardTitle>
          <CardDescription>
            Track your own brand plus the competitors you expect to share the answer with.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Name</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Acme"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-domain">Domain</Label>
              <Input
                id="brand-domain"
                value={brandDomain}
                onChange={(e) => setBrandDomain(e.target.value)}
                placeholder="acme.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brand-aliases">Aliases (comma separated)</Label>
              <Input
                id="brand-aliases"
                value={brandAliases}
                onChange={(e) => setBrandAliases(e.target.value)}
                placeholder="Acme Inc, Acme Corp"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2 pb-2">
                <Switch id="is-client" checked={isClient} onCheckedChange={setIsClient} />
                <Label htmlFor="is-client">My brand</Label>
              </div>
              <Button onClick={addBrand} disabled={savingBrand || !brandName.trim()}>
                {savingBrand ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {brands.length === 0 && (
              <p className="text-sm text-muted-foreground">No brands yet — add one above.</p>
            )}
            {brands.map((brand) => (
              <Badge key={brand.id} variant={brand.is_client ? "default" : "secondary"}>
                {brand.name}
                {brand.domain ? ` · ${brand.domain}` : ""}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListChecks className="h-4 w-4 text-primary" /> Prompt panel
          </CardTitle>
          <CardDescription>
            A fixed set of prompts sampled repeatedly. Keep it stable — changing prompts resets the
            comparison baseline.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Panel</Label>
              <Select value={selectedPanel} onValueChange={setSelectedPanel}>
                <SelectTrigger>
                  <SelectValue placeholder="No panel yet" />
                </SelectTrigger>
                <SelectContent>
                  {brandPanels.map((panel) => (
                    <SelectItem key={panel.id} value={panel.id}>
                      v{panel.version} · {panel.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={createPanel} disabled={!selectedBrand}>
                <Plus className="h-4 w-4" /> New panel version
              </Button>
            </div>
          </div>

          {selectedPanel && (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="prompt-text">Prompt</Label>
                  <Textarea
                    id="prompt-text"
                    rows={2}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="What is the best project management tool for agencies?"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Intent</Label>
                  <Select value={intentStage} onValueChange={setIntentStage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENT_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Class</Label>
                  <Select value={promptClass} onValueChange={setPromptClass}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROMPT_CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addPrompt} disabled={savingPrompt || !promptText.trim()}>
                  {savingPrompt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add prompt
                </Button>
              </div>

              <div className="divide-y rounded-lg border">
                {promptsLoading && <div className="p-4 text-sm text-muted-foreground">Loading prompts…</div>}
                {!promptsLoading && prompts.length === 0 && (
                  <div className="space-y-3 p-4 text-sm text-muted-foreground">
                    <p>
                      No prompts yet. A panel needs enough prompts to cover awareness, comparison and
                      decision intent.
                    </p>
                    <Button variant="outline" size="sm" onClick={seedStarterPrompts} disabled={seeding}>
                      {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />}
                      Create default starter prompts
                    </Button>
                  </div>
                )}

                {prompts.map((prompt) => (
                  <div key={prompt.id} className="flex items-start gap-3 p-3">
                    <Switch
                      checked={prompt.is_active}
                      onCheckedChange={() => togglePrompt(prompt)}
                      aria-label="Toggle prompt active"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{prompt.text}</p>
                      <div className="mt-1 flex gap-2">
                        <Badge variant="outline">{prompt.intent_stage}</Badge>
                        <Badge variant="outline">{prompt.prompt_class}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePrompt(prompt)}
                      aria-label="Delete prompt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button asChild variant="secondary">
                <Link to="/aeo-dashboard">View measurement dashboard</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AEOSetupPage;
