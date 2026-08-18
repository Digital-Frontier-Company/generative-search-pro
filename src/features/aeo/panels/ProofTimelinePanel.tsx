import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { daysToDetect, ICC, MIN_WINDOW_DAYS } from "../power";

interface Props {
  /** Active prompts in the panel. */
  promptCount: number;
  /** Runs per prompt per day (replicates x assistants). */
  replicatesPerDay: number;
  /** Current answer share, 0-1. */
  baseline: number;
}

/**
 * The honest answer to "how long until I can prove this worked".
 *
 * Naive power maths treats replicates as independent and answers in days when
 * the truthful answer is weeks — repeated runs of the same prompt are heavily
 * correlated. This applies the Kish design effect and the reporting floor.
 */
const ProofTimelinePanel = ({ promptCount, replicatesPerDay, baseline }: Props) => {
  const [liftPoints, setLiftPoints] = useState(10);

  const result = useMemo(
    () =>
      daysToDetect({
        baseline: baseline || 0.15,
        lift: liftPoints / 100,
        promptCount: Math.max(1, promptCount),
        replicatesPerDay: Math.max(1, replicatesPerDay),
      }),
    [baseline, liftPoints, promptCount, replicatesPerDay],
  );

  const naiveDays = Number.isFinite(result.naiveRuns)
    ? Math.max(1, Math.ceil(result.naiveRuns / result.runsPerDay))
    : Infinity;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-4 w-4 text-primary" /> How long until it&apos;s provable
        </CardTitle>
        <CardDescription>
          Repeat runs of the same question are correlated, so they count for less than they look.
          This applies that correction instead of quoting an optimistic number.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="lift-slider">Gain you want to prove</Label>
            <span className="text-sm font-medium">+{liftPoints} points of answer share</span>
          </div>
          <Slider
            id="lift-slider"
            min={1}
            max={40}
            step={1}
            value={[liftPoints]}
            onValueChange={([v]) => setLiftPoints(v)}
            aria-label="Answer share gain to detect, in percentage points"
          />
          <p className="text-xs text-muted-foreground">
            From today&apos;s {(baseline * 100).toFixed(1)}% to{" "}
            {((baseline + liftPoints / 100) * 100).toFixed(1)}%.
          </p>
        </div>

        <div className="rounded-md border p-4">
          <p className="text-3xl font-semibold">
            {result.impractical ? "Not provable" : `${result.days} days`}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{result.summary}</p>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Naive estimate</p>
            <p className="font-medium">
              {Number.isFinite(naiveDays) ? `${naiveDays} days` : "—"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Correlation penalty</p>
            <p className="font-medium">{result.deff.toFixed(1)}x</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Runs per day</p>
            <p className="font-medium">{result.runsPerDay.toLocaleString()}</p>
          </div>
        </div>

        {result.flooredByMethodology && (
          <Badge variant="outline">Held at the {MIN_WINDOW_DAYS}-day reporting floor</Badge>
        )}

        {result.advice.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {result.advice.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          Assumes {promptCount} active prompts, {replicatesPerDay} runs per prompt per day, 95%
          confidence at 80% power, and a within-prompt correlation of {ICC}.
        </p>
      </CardContent>
    </Card>
  );
};

export default ProofTimelinePanel;
