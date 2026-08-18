import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { estimateCost, validatePanel, type PanelPrompt } from "../panelValidator";

interface Props {
  prompts: PanelPrompt[];
  brandName: string;
  brandAliases?: string[];
}

/**
 * Checks a prompt panel before anyone pays to run it.
 *
 * Two things go wrong silently: a panel stuffed with the client's own brand
 * name (which scores well and means nothing), and a panel whose monthly cost
 * nobody worked out until the invoice arrived.
 */
const PanelHealthCard = ({ prompts, brandName, brandAliases }: Props) => {
  const [assistants, setAssistants] = useState("2");
  const [replicates, setReplicates] = useState("7");
  const [budget, setBudget] = useState("500");

  const cost = useMemo(
    () =>
      estimateCost({
        promptCount: prompts.filter((p) => p.is_active !== false).length,
        replicatesPerDay: Number(replicates) || 0,
        modelCount: Number(assistants) || 0,
        daysPerMonth: 30,
      }),
    [prompts, replicates, assistants],
  );

  const result = useMemo(
    () =>
      validatePanel(prompts, { name: brandName, aliases: brandAliases }, {
        cost,
        budgetUsd: Number(budget) || undefined,
      }),
    [prompts, brandName, brandAliases, cost, budget],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {result.ok ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-destructive" />
          )}
          Panel check and cost
        </CardTitle>
        <CardDescription>
          What this question list will measure, and what it will cost to run every month.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="assistants">AI assistants sampled</Label>
            <Input
              id="assistants"
              type="number"
              min={1}
              max={6}
              value={assistants}
              onChange={(e) => setAssistants(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="replicates">Runs per question per day</Label>
            <Input
              id="replicates"
              type="number"
              min={1}
              max={40}
              value={replicates}
              onChange={(e) => setReplicates(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="budget">Monthly budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Active questions</p>
            <p className="text-2xl font-semibold">{result.activeCount}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Calls per month</p>
            <p className="text-2xl font-semibold">{cost.callsPerMonth.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Wallet className="h-3 w-3" /> Projected cost
            </p>
            <p className="text-2xl font-semibold">${cost.costPerMonthUsd.toFixed(0)}/mo</p>
          </div>
        </div>

        <div className="space-y-2">
          {result.issues.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Balanced, unique, and big enough to break down by question type.
            </p>
          ) : (
            result.issues.map((issue, i) => (
              <div
                key={`${issue.title}-${i}`}
                className={`rounded-md border p-3 text-sm ${
                  issue.level === "error" ? "border-destructive/50" : "border-amber-500/40"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {issue.level === "error" ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Info className="h-4 w-4 text-amber-500" />
                  )}
                  {issue.title}
                </div>
                <p className="mt-1 text-muted-foreground">{issue.detail}</p>
                {issue.examples?.length ? (
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {issue.examples.map((ex) => (
                      <li key={ex}>• {ex}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(result.classCounts).map(([cls, count]) => (
            <Badge key={cls} variant="outline">
              {cls.replace(/_/g, " ")}: {count}
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Cost assumes 30 sampling days a month at a blended $0.012 per assistant call. Add
          assistants and the bill scales with them, one for one.
        </p>
      </CardContent>
    </Card>
  );
};

export default PanelHealthCard;
