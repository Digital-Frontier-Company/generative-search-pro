import { useCallback, useEffect, useMemo, useState } from "react";
import { History, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MIN_WINDOW_DAYS } from "../power";

/** Values accepted by the interventions table's type constraint. */
const CHANGE_TYPES: { value: string; label: string }[] = [
  { value: "content", label: "Content published or rewritten" },
  { value: "schema", label: "Structured data / schema" },
  { value: "off_site_mention", label: "Off-site mention" },
  { value: "review", label: "Review or listing" },
  { value: "directory", label: "Directory entry" },
  { value: "wikidata", label: "Wikidata / knowledge graph" },
  { value: "pr", label: "PR or press" },
  { value: "technical", label: "Technical fix" },
  { value: "other", label: "Other" },
];

interface InterventionRow {
  id: string;
  type: string;
  description: string;
  target_url: string | null;
  shipped_at: string;
  expected_lag_days: number;
}

interface Props {
  accountId: string | null;
  brandId: string;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The change log exists so an improvement can later be attributed to something.
 * Without a dated record of what shipped, a rise in answer share is just a
 * rise — you cannot tell a client which of their changes caused it.
 */
const ChangeLogPanel = ({ accountId, brandId }: Props) => {
  const [rows, setRows] = useState<InterventionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const [type, setType] = useState("content");
  const [description, setDescription] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [shippedAt, setShippedAt] = useState(today());
  const [lagDays, setLagDays] = useState(String(MIN_WINDOW_DAYS));

  const load = useCallback(async () => {
    if (!brandId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("interventions")
      .select("id,type,description,target_url,shipped_at,expected_lag_days")
      .eq("brand_id", brandId)
      .order("shipped_at", { ascending: false })
      .limit(50);
    if (error) toast.error(error.message);
    setRows((data as InterventionRow[]) ?? []);
    setLoading(false);
  }, [brandId]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setDescription("");
    setTargetUrl("");
    setShippedAt(today());
    setLagDays(String(MIN_WINDOW_DAYS));
  };

  const save = async () => {
    if (!accountId || !brandId) {
      toast.error("Pick a brand first.");
      return;
    }
    if (!description.trim()) {
      toast.error("Describe what shipped — a bare date proves nothing later.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("interventions").insert({
      account_id: accountId,
      brand_id: brandId,
      type,
      description: description.trim(),
      target_url: targetUrl.trim() || null,
      shipped_at: new Date(shippedAt).toISOString(),
      expected_lag_days: Number(lagDays) || MIN_WINDOW_DAYS,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Change logged.");
    reset();
    setOpen(false);
    load();
  };

  const maturing = useMemo(
    () =>
      rows.filter((r) => {
        const ready =
          new Date(r.shipped_at).getTime() + r.expected_lag_days * 86_400_000;
        return ready > Date.now();
      }).length,
    [rows],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-4 w-4 text-primary" /> Change log
            </CardTitle>
            <CardDescription>
              Record what you shipped and when. Later, this is the only thing that lets you say a
              change caused a gain rather than guessing.
            </CardDescription>
          </div>
          <Button size="sm" variant={open ? "outline" : "default"} onClick={() => setOpen(!open)}>
            <Plus className="mr-1 h-4 w-4" /> {open ? "Cancel" : "Log a change"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {open && (
          <div className="space-y-3 rounded-md border p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="change-type">What kind of change</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="change-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="change-date">Date it went live</Label>
                <Input
                  id="change-date"
                  type="date"
                  value={shippedAt}
                  max={today()}
                  onChange={(e) => setShippedAt(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="change-desc">What changed</Label>
              <Textarea
                id="change-desc"
                rows={2}
                placeholder="Rewrote the pricing page with a comparison table and FAQ schema"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="change-url">Page it affects (optional)</Label>
                <Input
                  id="change-url"
                  placeholder="https://example.com/pricing"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="change-lag">Days before you expect an effect</Label>
                <Input
                  id="change-lag"
                  type="number"
                  min={1}
                  max={180}
                  value={lagDays}
                  onChange={(e) => setLagDays(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save change"}
            </Button>
          </div>
        )}

        {loading ? (
          <Skeleton className="h-20 w-full" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing logged yet. Start now — a change log built after the fact is guesswork.
          </p>
        ) : (
          <>
            {maturing > 0 && (
              <p className="text-sm text-muted-foreground">
                {maturing} change{maturing === 1 ? "" : "s"} still inside the expected lag window —
                too early to read the result.
              </p>
            )}
            <ul className="space-y-2">
              {rows.map((row) => {
                const shipped = new Date(row.shipped_at);
                const readyAt = new Date(shipped.getTime() + row.expected_lag_days * 86_400_000);
                const mature = readyAt.getTime() <= Date.now();
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3 text-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {CHANGE_TYPES.find((t) => t.value === row.type)?.label ?? row.type}
                        </Badge>
                        <span className="text-muted-foreground">
                          {shipped.toLocaleDateString()}
                        </span>
                        <Badge variant={mature ? "default" : "outline"}>
                          {mature ? "ready to read" : `maturing until ${readyAt.toLocaleDateString()}`}
                        </Badge>
                      </div>
                      <p>{row.description}</p>
                      {row.target_url && (
                        <a
                          href={row.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline underline-offset-2"
                        >
                          {row.target_url}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangeLogPanel;
