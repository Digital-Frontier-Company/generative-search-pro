import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Network, RefreshCw, Download } from "lucide-react";
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
  buildSourceNodes,
  concentrationStats,
  targetsByHorizon,
  PLAYBOOK,
  type RawSourceRow,
  type SourceNode,
} from "@/features/citation/sourceGraph";
import { toast } from "sonner";

const pct = (v: number) => `${(Number(v) * 100).toFixed(1)}%`;

const SourceGraphPanel = () => {
  const { brands, panels, loading: wsLoading, error: wsError } = useAeoWorkspace();
  const [brandId, setBrandId] = useState<string>("");
  const [windowDays, setWindowDays] = useState("28");
  const [rows, setRows] = useState<SourceNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!brandId && brands.length) setBrandId(brands.find((b) => b.is_client)?.id ?? brands[0].id);
  }, [brands, brandId]);

  const brand = brands.find((b) => b.id === brandId);
  const panel = useMemo(
    () =>
      panels.find((p) => p.brand_id === brandId && p.status === "active") ??
      panels.find((p) => p.brand_id === brandId),
    [panels, brandId],
  );

  const load = useCallback(async () => {
    if (!panel) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("source_graph", {
        p_panel_id: panel.id,
        p_end_date: new Date().toISOString().slice(0, 10),
        p_window_days: Number(windowDays),
        p_client_domain: brand?.domain ?? null,
      });
      if (error) throw error;
      setRows(buildSourceNodes((data ?? []) as RawSourceRow[]));
    } catch (e: any) {
      toast.error(e?.message ?? "Could not load the source graph.");
    } finally {
      setLoading(false);
    }
  }, [panel, windowDays, brand?.domain]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => (rows.length ? concentrationStats(rows) : null), [rows]);
  const byLeverage = useMemo(() => [...rows].sort((a, b) => b.leverage - a.leverage).slice(0, 40), [rows]);
  const horizons = useMemo(() => targetsByHorizon(rows), [rows]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ stats, sources: rows }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `source-graph-${brand?.domain ?? "panel"}.json`;
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
            <Network className="h-4 w-4 text-primary" /> Source graph
          </CardTitle>
          <CardDescription>
            Which domains assistants actually cite in your category, ranked by leverage — citation share,
            discounted for what you already own and what you cannot realistically enter.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger className="w-[220px]" aria-label="Brand">
              <SelectValue placeholder={wsLoading ? "Loading brands…" : "Select a brand"} />
            </SelectTrigger>
            <SelectContent>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={windowDays} onValueChange={setWindowDays}>
            <SelectTrigger className="w-[150px]" aria-label="Window">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="28">28 days</SelectItem>
              <SelectItem value="56">56 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading || !panel}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          {rows.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportJson}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          )}
        </CardContent>
      </Card>

      {!panel && !wsLoading && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No prompt panel yet for this brand. Set one up in AEO Measurement, run sampling, then the
            source graph fills in.
          </CardContent>
        </Card>
      )}

      {panel && !loading && rows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No citations in this window. Citations require web-grounded model responses — if sampling has
            run and this stays empty, the provider is answering without web search.
          </CardContent>
        </Card>
      )}

      {stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "domains = 80% of citations", value: stats.domainsFor80 },
              { label: "of those include you", value: stats.clientInHead },
              { label: "reachable targets", value: stats.reachableTargets },
              { label: "your citation share", value: pct(stats.clientShare) },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <p className="text-2xl font-semibold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Concentration</CardTitle>
              <CardDescription>
                50% of citations come from {stats.domainsFor50} domains, 80% from {stats.domainsFor80}, out of{" "}
                {stats.totalDomains} observed. {stats.read}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top sources by leverage</CardTitle>
              <CardDescription>
                Sorted by what to do first, not by what is biggest. NARROW marks a domain whose citations come
                from very few distinct prompts — weaker evidence than the raw count suggests.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Access</TableHead>
                    <TableHead className="text-right">Cites</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                    <TableHead className="text-right">Cum.</TableHead>
                    <TableHead>You</TableHead>
                    <TableHead className="text-right">Leverage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byLeverage.map((n) => (
                    <TableRow key={n.domain}>
                      <TableCell className="text-muted-foreground">{n.leverage_rank}</TableCell>
                      <TableCell className="font-medium">
                        {n.domain}
                        {n.narrow && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            NARROW
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{n.sourceType}</TableCell>
                      <TableCell className="text-xs">{n.accessibility}</TableCell>
                      <TableCell className="text-right">{n.citation_count}</TableCell>
                      <TableCell className="text-right">{pct(n.share_of_citations)}</TableCell>
                      <TableCell className="text-right">{pct(n.cumulative_share)}</TableCell>
                      <TableCell>{n.client_present ? <Badge>present</Badge> : "—"}</TableCell>
                      <TableCell className="text-right">{n.leverage.toFixed(4)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Target list by horizon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(horizons) as (keyof typeof horizons)[]).map((h) =>
                horizons[h].length ? (
                  <div key={h}>
                    <p className="mb-1 text-sm font-medium">{h}</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {horizons[h].slice(0, 15).map((n) => (
                        <li key={n.domain}>
                          <span className="font-medium text-foreground">{n.domain}</span> ({n.sourceType},{" "}
                          {pct(n.share_of_citations)} of citations) — {PLAYBOOK[n.sourceType] ?? PLAYBOOK.other}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">What this does not tell you</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>
                  Models also answer from parametric memory with no citation at all. This maps the retrievable
                  surface — the part you can influence — not the total.
                </li>
                <li>
                  Source sets shift 34–42% day over day. The head of this distribution is stable; the tail is
                  not, and should not be treated as a fixed list.
                </li>
                <li>
                  Being cited raises the odds of retrieval. It does not guarantee the model recommends you —
                  what the page says about you still matters.
                </li>
                <li>Citations send very little referral traffic. The value is the mention inside the answer.</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SourceGraphPanel;
