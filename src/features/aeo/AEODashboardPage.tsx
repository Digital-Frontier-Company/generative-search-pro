import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Loader2, Play, Network } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invokeTool } from "@/lib/toolInvoke";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAeoWorkspace } from "./useAeoWorkspace";

interface WindowScore {
  model: string;
  prompt_class: string;
  n_runs: number;
  n_mentions: number;
  answer_share: number;
  ci_low: number;
  ci_high: number;
  is_reliable: boolean;
  reliability_note: string | null;
}

interface SourceRow {
  domain: string;
  source_type: string | null;
  citation_count: number;
  distinct_prompts: number;
  share_of_citations: number;
  cumulative_share: number;
  client_present: boolean;
  leverage_rank: number;
}

const pct = (value: number) => `${(Number(value) * 100).toFixed(1)}%`;

const AEODashboardPage = () => {
  const { brands, panels, loading: workspaceLoading, error: workspaceError } = useAeoWorkspace();
  const [brandId, setBrandId] = useState("");
  const [windowDays, setWindowDays] = useState("28");
  const [scores, setScores] = useState<WindowScore[]>([]);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; severity: string; message: string }[]>([]);
  const [floor, setFloor] = useState<number | null>(null);
  const [activePrompts, setActivePrompts] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!brandId && brands.length) setBrandId(brands.find((b) => b.is_client)?.id ?? brands[0].id);
  }, [brands, brandId]);

  const brand = brands.find((b) => b.id === brandId);
  const panel = useMemo(
    () => panels.find((p) => p.brand_id === brandId && p.status === "active") ?? panels.find((p) => p.brand_id === brandId),
    [panels, brandId],
  );

  const loadData = useCallback(async () => {
    if (!brandId) return;
    setLoading(true);
    try {
      const endDate = new Date().toISOString().slice(0, 10);
      const days = Number(windowDays);

      const [scoreRes, floorRes] = await Promise.all([
        (supabase.rpc as any)("answer_share_window", {
          p_brand_id: brandId,
          p_end_date: endDate,
          p_window_days: days,
          p_model: null,
          p_prompt_class: null,
        }),
        supabase.from("methodology_config").select("key,value").eq("key", "min_runs_per_prompt").maybeSingle(),
      ]);
      if (scoreRes.error) throw scoreRes.error;
      setScores((scoreRes.data ?? []) as WindowScore[]);
      setFloor(floorRes.data ? Number(floorRes.data.value) : null);

      if (panel) {
        const [sourceRes, alertRes, promptRes] = await Promise.all([
          (supabase.rpc as any)("source_graph", {
            p_panel_id: panel.id,
            p_end_date: endDate,
            p_window_days: days,
            p_client_domain: brand?.domain ?? null,
          }),
          supabase
            .from("harness_alerts")
            .select("id,severity,message")
            .eq("panel_id", panel.id)
            .is("resolved_at", null)
            .order("detected_at", { ascending: false })
            .limit(5),
          supabase
            .from("prompts")
            .select("id", { count: "exact", head: true })
            .eq("panel_id", panel.id)
            .eq("is_active", true),
        ]);
        if (sourceRes.error) throw sourceRes.error;
        setSources((sourceRes.data ?? []) as SourceRow[]);
        setAlerts(alertRes.data ?? []);
        setActivePrompts(promptRes.count ?? 0);
      } else {
        setSources([]);
        setAlerts([]);
        setActivePrompts(null);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not load measurements.");
    } finally {
      setLoading(false);
    }
  }, [brandId, windowDays, panel, brand?.domain]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runSampling = async () => {
    if (!panel) return;
    setRunning(true);
    try {
      const result = await invokeTool<any>("run-panel", { panel_id: panel.id });
      toast.success(`Sampling complete — ${result?.calls_attempted ?? 0} model calls`);
      await loadData();
    } catch (e: any) {
      toast.error(e?.message ?? "Sampling run failed.");
    } finally {
      setRunning(false);
    }
  };

  const overall = useMemo(() => {
    if (!scores.length) return null;
    const runs = scores.reduce((sum, s) => sum + Number(s.n_runs), 0);
    const mentions = scores.reduce((sum, s) => sum + Number(s.n_mentions), 0);
    return { runs, mentions, share: runs ? mentions / runs : 0 };
  }, [scores]);

  if (workspaceLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Helmet>
        <title>AEO Measurement Dashboard | Generative Search Pro</title>
        <meta
          name="description"
          content="Answer share with confidence intervals, citation source leverage and harness health for your AI visibility panels."
        />
      </Helmet>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">AEO Measurement</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Answer share is estimated from repeated samples with Wilson confidence intervals. A point
          estimate without an interval is noise.
        </p>
      </header>

      {workspaceError && (
        <Card className="border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{workspaceError}</CardContent>
        </Card>
      )}

      {brands.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
            <p>No brands yet. Set up a brand and a prompt panel first.</p>
            <Button asChild>
              <Link to="/aeo-setup">Go to panel setup</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="flex flex-wrap items-end gap-3 p-4">
              <div className="space-y-1.5">
                <Label>Brand</Label>
                <Select value={brandId} onValueChange={setBrandId}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Window</Label>
                <Select value={windowDays} onValueChange={setWindowDays}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="28">28 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={loadData} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                Refresh
              </Button>
              <Button onClick={runSampling} disabled={!panel || running}>
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {running ? "Sampling…" : "Run sampling now"}
              </Button>
              {!panel && (
                <span className="text-sm text-muted-foreground">
                  This brand has no panel yet —{" "}
                  <Link className="underline" to="/aeo-setup">
                    create one
                  </Link>
                  .
                </span>
              )}
            </CardContent>
          </Card>

          {alerts.length > 0 && (
            <Card className="border-amber-500/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Harness health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2">
                    <Badge variant="outline">{alert.severity}</Badge>
                    <span className="text-muted-foreground">{alert.message}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Answer share ({windowDays}d)</CardDescription>
                <CardTitle className="text-3xl">{overall ? pct(overall.share) : "—"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={overall ? overall.share * 100 : 0} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Samples</CardDescription>
                <CardTitle className="text-3xl">{overall?.runs ?? 0}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {overall?.mentions ?? 0} mentions across all models
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Methodology floor</CardDescription>
                <CardTitle className="text-3xl">{floor ?? "—"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                minimum runs per prompt per day for a reliable estimate
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Answer share by model and prompt class</CardTitle>
              <CardDescription>
                Intervals are Wilson 95%. Rows below the sampling floor are flagged as unreliable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scores.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No runs in this window yet. Run sampling to start collecting measurements.
                </p>
              )}
              {scores.map((score, index) => (
                <div key={`${score.model}-${score.prompt_class}-${index}`} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {score.model} · {score.prompt_class}
                    </span>
                    <span className="text-muted-foreground">
                      {pct(score.answer_share)} (CI {pct(score.ci_low)}–{pct(score.ci_high)}) ·{" "}
                      {score.n_mentions}/{score.n_runs} runs
                      {!score.is_reliable && (
                        <Badge variant="outline" className="ml-2">
                          low sample
                        </Badge>
                      )}
                    </span>
                  </div>
                  <div className="relative h-2 w-full rounded-full bg-muted">
                    <div
                      className="absolute h-2 rounded-full bg-primary/30"
                      style={{
                        left: `${Number(score.ci_low) * 100}%`,
                        width: `${Math.max((Number(score.ci_high) - Number(score.ci_low)) * 100, 1)}%`,
                      }}
                    />
                    <div
                      className="absolute h-2 w-1 rounded-full bg-primary"
                      style={{ left: `${Number(score.answer_share) * 100}%` }}
                    />
                  </div>
                  {score.reliability_note && (
                    <p className="text-xs text-muted-foreground">{score.reliability_note}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="h-4 w-4 text-primary" /> Source leverage graph
              </CardTitle>
              <CardDescription>
                The domains AI answers actually cite for your panel — ranked by how much of the
                citation mass they control.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sources.length === 0 && (
                <p className="text-sm text-muted-foreground">No citations captured in this window.</p>
              )}
              {sources.map((source) => (
                <div
                  key={`${source.domain}-${source.leverage_rank}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-muted-foreground">#{source.leverage_rank}</span>
                    <span className="font-medium">{source.domain}</span>
                    {source.source_type && <Badge variant="outline">{source.source_type}</Badge>}
                    {source.client_present && <Badge>you are cited</Badge>}
                  </div>
                  <span className="text-muted-foreground">
                    {pct(source.share_of_citations)} of citations · {source.citation_count} cites ·{" "}
                    {source.distinct_prompts} prompts
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AEODashboardPage;
