import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Swords, RefreshCw, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAeoWorkspace } from "@/features/aeo/useAeoWorkspace";
import {
  buildTeardown,
  mentionKey,
  MIN_RUNS_SOURCE,
  type TeardownInput,
  type TeardownReport,
} from "@/features/citation/teardown";
import { toast } from "sonner";

const PAGE = 1000;
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** Supabase caps rows per request, so page through anything run-scoped. */
async function fetchAll<T>(
  table: string,
  columns: string,
  runIds: string[],
): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < runIds.length; i += 200) {
    const chunk = runIds.slice(i, i + 200);
    let from = 0;
    for (;;) {
      const { data, error } = await (supabase as any)
        .from(table)
        .select(columns)
        .in("run_id", chunk)
        .range(from, from + PAGE - 1);
      if (error) throw error;
      out.push(...((data ?? []) as T[]));
      if (!data || data.length < PAGE) break;
      from += PAGE;
    }
  }
  return out;
}

const CompetitorTeardownPanel = () => {
  const { brands, panels, loading: wsLoading, error: wsError } = useAeoWorkspace();
  const [clientId, setClientId] = useState("");
  const [competitorId, setCompetitorId] = useState("");
  const [windowDays, setWindowDays] = useState("28");
  const [report, setReport] = useState<TeardownReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientId && brands.length) {
      setClientId(brands.find((b) => b.is_client)?.id ?? brands[0].id);
    }
  }, [brands, clientId]);

  useEffect(() => {
    if (!competitorId && brands.length) {
      const other = brands.find((b) => b.id !== clientId);
      if (other) setCompetitorId(other.id);
    }
  }, [brands, clientId, competitorId]);

  const client = brands.find((b) => b.id === clientId);
  const competitor = brands.find((b) => b.id === competitorId);
  const panel = useMemo(
    () =>
      panels.find((p) => p.brand_id === clientId && p.status === "active") ??
      panels.find((p) => p.brand_id === clientId),
    [panels, clientId],
  );

  const run = useCallback(async () => {
    if (!panel || !client || !competitor || client.id === competitor.id) return;
    setLoading(true);
    try {
      const { data: prompts, error: pErr } = await supabase
        .from("prompts")
        .select("id,prompt_class")
        .eq("panel_id", panel.id);
      if (pErr) throw pErr;
      if (!prompts?.length) throw new Error("This panel has no prompts yet.");

      const promptClass = new Map(prompts.map((p: any) => [p.id, p.prompt_class ?? "unknown"]));
      const since = new Date(Date.now() - Number(windowDays) * 86400000)
        .toISOString()
        .slice(0, 10);

      const { data: runs, error: rErr } = await supabase
        .from("runs")
        .select("id,prompt_id,run_date")
        .in("prompt_id", Array.from(promptClass.keys()))
        .eq("status", "ok")
        .gte("run_date", since);
      if (rErr) throw rErr;
      if (!runs?.length) throw new Error("No successful runs in this window.");

      const runIds = runs.map((r: any) => r.id);
      const runClass = new Map<string, string>(
        runs.map((r: any) => [r.id, promptClass.get(r.prompt_id) ?? "unknown"]),
      );
      const nDays = new Set(runs.map((r: any) => r.run_date)).size;

      const brandName = new Map(brands.map((b) => [b.id, b.name]));
      const mentions = await fetchAll<any>("mentions", "run_id,brand_id,position,is_endorsed", runIds);
      const cites = await fetchAll<any>("citations", "run_id,domain", runIds);

      const mentionsByRun = new Map<string, Set<string>>();
      runIds.forEach((id) => mentionsByRun.set(id, new Set()));
      const positions = new Map<string, number>();
      const endorsed = new Map<string, boolean>();
      for (const m of mentions) {
        const name = brandName.get(m.brand_id) ?? "?";
        mentionsByRun.get(m.run_id)?.add(name);
        positions.set(mentionKey(m.run_id, name), m.position ?? 99);
        endorsed.set(mentionKey(m.run_id, name), Boolean(m.is_endorsed));
      }

      const citesByRun = new Map<string, string[]>();
      for (const c of cites) {
        const list = citesByRun.get(c.run_id) ?? [];
        list.push(c.domain);
        citesByRun.set(c.run_id, list);
      }

      const input: TeardownInput = {
        mentionsByRun,
        citesByRun,
        runClass,
        positions,
        endorsed,
        nDays,
        nPrompts: promptClass.size,
      };
      const result = buildTeardown(input, client.name, competitor.name);
      if (!result.partition.W && !result.partition.L && !result.partition.B) {
        throw new Error(
          `Neither ${client.name} nor ${competitor.name} was mentioned in any run in this window.`,
        );
      }
      setReport(result);
    } catch (e: any) {
      setReport(null);
      toast.error(e?.message ?? "Could not build the teardown.");
    } finally {
      setLoading(false);
    }
  }, [panel, client, competitor, windowDays, brands]);

  const exportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teardown-${client?.name ?? "client"}-vs-${competitor?.name ?? "competitor"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (wsError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">{wsError}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Swords className="h-4 w-4 text-primary" /> Competitor teardown
          </CardTitle>
          <CardDescription>
            Splits your panel runs by who got mentioned, then diffs the cited sources — separating
            placement gaps (they get cited where you never appear) from representation gaps (you are
            both on the page and the model still prefers them).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger className="w-[200px]" aria-label="Client brand">
              <SelectValue placeholder={wsLoading ? "Loading brands…" : "Client brand"} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={competitorId} onValueChange={setCompetitorId}>
            <SelectTrigger className="w-[200px]" aria-label="Competitor brand">
              <SelectValue placeholder="Competitor" />
            </SelectTrigger>
            <SelectContent>
              {brands
                .filter((b) => b.id !== clientId)
                .map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={windowDays} onValueChange={setWindowDays}>
            <SelectTrigger className="w-[140px]" aria-label="Window">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="28">28 days</SelectItem>
              <SelectItem value="56">56 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={run} disabled={loading || !panel || !competitor}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Run teardown
          </Button>
          {report && (
            <Button variant="outline" onClick={exportJson}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          )}
          {!panel && !wsLoading && (
            <span className="text-sm text-muted-foreground">
              Create a prompt panel for this brand first.
            </span>
          )}
        </CardContent>
      </Card>

      {report && (
        <>
          {report.belowFloor && (
            <Card className="border-amber-500/40">
              <CardContent className="flex gap-3 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p>
                  <strong>Below the sampling floor.</strong> {report.runsPerPromptDay.toFixed(1)}{" "}
                  runs/prompt/day against a floor of {MIN_RUNS_SOURCE} for source-level analysis.
                  Sources that look unique to one set are probably sampling noise. Treat this as
                  exploratory, not diagnostic.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">The gap</CardTitle>
              <CardDescription>
                {report.totalRuns} runs — competitor-only {report.partition.W}, client-only{" "}
                {report.partition.L}, both {report.partition.B}, neither {report.partition.N}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand</TableHead>
                    <TableHead>Answer share</TableHead>
                    <TableHead>95% CI</TableHead>
                    <TableHead>Runs mentioned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{client?.name}</TableCell>
                    <TableCell>{pct(report.client.point)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      [{pct(report.client.low)}, {pct(report.client.high)}]
                    </TableCell>
                    <TableCell>{report.client.hits}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{competitor?.name}</TableCell>
                    <TableCell>{pct(report.competitor.point)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      [{pct(report.competitor.low)}, {pct(report.competitor.high)}]
                    </TableCell>
                    <TableCell>{report.competitor.hits}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-sm text-muted-foreground">
                {report.overlap ? (
                  <>
                    The intervals overlap — this gap is <strong>not statistically established</strong>.
                    Report it as directional. Widening the window is cheaper than increasing daily
                    samples.
                  </>
                ) : (
                  <>
                    <strong>{report.leader} leads by a real margin</strong> —{" "}
                    {report.gapPoints.toFixed(1)} percentage points, non-overlapping intervals.
                  </>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Where it's concentrated</CardTitle>
              {report.worstClass && (
                <CardDescription>
                  The gap is worst on <strong>{report.worstClass}</strong> prompts. Concentrate effort
                  there rather than spreading across all classes.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prompt class</TableHead>
                    <TableHead>Competitor only</TableHead>
                    <TableHead>Client only</TableHead>
                    <TableHead>Both</TableHead>
                    <TableHead>Neither</TableHead>
                    <TableHead>Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byClass.map((r) => (
                    <TableRow key={r.promptClass}>
                      <TableCell>{r.promptClass}</TableCell>
                      <TableCell>{r.W}</TableCell>
                      <TableCell>{r.L}</TableCell>
                      <TableCell>{r.B}</TableCell>
                      <TableCell>{r.N}</TableCell>
                      <TableCell className={r.net < 0 ? "text-destructive" : ""}>
                        {r.net > 0 ? "+" : ""}
                        {r.net}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Placement gaps</CardTitle>
              <CardDescription>
                Cited when they win, absent when you do. This is the target list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.placementGaps.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Cites/run (theirs)</TableHead>
                      <TableHead>Raw cites</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.placementGaps.map((d) => (
                      <TableRow key={d.domain}>
                        <TableCell className="font-mono text-xs">{d.domain}</TableCell>
                        <TableCell>{d.theirsPerRun.toFixed(2)}</TableCell>
                        <TableCell>{d.theirsRaw}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Get cited here</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No sources are uniquely associated with their wins. This is not a placement problem —
                  look at representation and position.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Representation gaps</CardTitle>
              <CardDescription>
                Both brands cited, you still lose. Placement will not help here — what these pages say
                is the problem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.representationGaps.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Cites/run (theirs)</TableHead>
                        <TableHead>Cites/run (ours)</TableHead>
                        <TableHead>Delta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.representationGaps.map((d) => (
                        <TableRow key={d.domain}>
                          <TableCell className="font-mono text-xs">{d.domain}</TableCell>
                          <TableCell>{d.theirsPerRun.toFixed(2)}</TableCell>
                          <TableCell>{d.oursPerRun.toFixed(2)}</TableCell>
                          <TableCell>+{(d.theirsPerRun - d.oursPerRun).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="text-sm text-muted-foreground">
                    For each: read the page. Compare rating, review count, recency, listing
                    completeness, and how you are described versus them. The fix is editorial or
                    reputational, not another placement.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shared sources with a meaningful delta.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What you already own</CardTitle>
                <CardDescription>Defend these — keep listings current and reviews fresh.</CardDescription>
              </CardHeader>
              <CardContent>
                {report.owned.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Cites/run</TableHead>
                        <TableHead>Raw</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.owned.map((d) => (
                        <TableRow key={d.domain}>
                          <TableCell className="font-mono text-xs">{d.domain}</TableCell>
                          <TableCell>{d.oursPerRun.toFixed(2)}</TableCell>
                          <TableCell>{d.oursRaw}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sources uniquely associated with your wins — a thin position.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">The "neither" set</CardTitle>
                <CardDescription>
                  {report.partition.N} runs named neither brand. These often reveal the real
                  competitor — a marketplace, directory or "how to choose" guide absorbing demand
                  before any vendor is named.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {report.neitherSources.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Cites</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.neitherSources.map((d) => (
                        <TableRow key={d.domain}>
                          <TableCell className="font-mono text-xs">{d.domain}</TableCell>
                          <TableCell>{d.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Every run named at least one of the two brands.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {report.position && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Position and endorsement quality</CardTitle>
                <CardDescription>
                  On the {report.position.bothRuns} runs mentioning both brands.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  {client?.name}: mean position{" "}
                  <strong>{report.position.clientMean.toFixed(1)}</strong> · endorsed{" "}
                  {report.position.clientEndorsed}/{report.position.bothRuns}
                </p>
                <p>
                  {competitor?.name}: mean position{" "}
                  <strong>{report.position.competitorMean.toFixed(1)}</strong> · endorsed{" "}
                  {report.position.competitorEndorsed}/{report.position.bothRuns}
                </p>
                {report.position.orderingProblem && (
                  <p className="text-muted-foreground">
                    {client?.name} is consistently named later. Presence is not the problem —
                    ordering is, and that is usually driven by review volume and rating on the shared
                    sources above.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Honest assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Before proposing a plan, judge whether this gap is closeable. If they are cited across
              trade press and news because they are an order of magnitude larger, that portion is not
              winnable this year — say so, and redirect budget to the long-tail and comparison classes
              where scale matters least. A teardown that recommends an unwinnable fight is worse than
              none.
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CompetitorTeardownPanel;
