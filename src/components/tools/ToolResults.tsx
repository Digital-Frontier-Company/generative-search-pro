import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type Priority = "high" | "medium" | "low";

export interface Recommendation {
  title: string;
  detail: string;
  priority: Priority;
  impact?: string;
  effort?: "quick win" | "moderate" | "project";
}

export interface ScoreItem {
  label: string;
  value: number;
  hint?: string;
}

interface ToolResultsProps {
  overallScore?: number;
  scoreLabel?: string;
  scores?: ScoreItem[];
  recommendations?: Recommendation[];
  summary?: string;
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const priorityStyles: Record<Priority, string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  low: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

const scoreTone = (value: number) =>
  value >= 80 ? "text-emerald-500" : value >= 60 ? "text-amber-500" : "text-destructive";

/**
 * Consistent results surface: headline score, sub-scores and a
 * priority-ordered list of what to do next.
 */
const ToolResults = ({
  overallScore,
  scoreLabel = "Overall score",
  scores = [],
  recommendations = [],
  summary,
}: ToolResultsProps) => {
  const ordered = [...recommendations].sort(
    (a, b) => priorityRank[a.priority] - priorityRank[b.priority]
  );

  return (
    <div className="space-y-6">
      {(overallScore !== undefined || scores.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{scoreLabel}</CardTitle>
            {summary && <CardDescription>{summary}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-5">
            {overallScore !== undefined && (
              <div className="flex items-end gap-3">
                <span className={cn("text-5xl font-semibold", scoreTone(overallScore))}>
                  {Math.round(overallScore)}
                </span>
                <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
              </div>
            )}

            {scores.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {scores.map((score) => (
                  <div key={score.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{score.label}</span>
                      <span className={cn("font-medium", scoreTone(score.value))}>
                        {Math.round(score.value)}
                      </span>
                    </div>
                    <Progress value={score.value} className="h-1.5" />
                    {score.hint && (
                      <p className="text-xs text-muted-foreground">{score.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {ordered.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What to do next</CardTitle>
            <CardDescription>Ordered by expected impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordered.map((rec, index) => (
              <div
                key={`${rec.title}-${index}`}
                className="rounded-lg border p-4 transition-colors hover:bg-accent/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">{index + 1}.</span>
                  <h3 className="font-medium">{rec.title}</h3>
                  <Badge variant="outline" className={cn("text-[10px] uppercase", priorityStyles[rec.priority])}>
                    {rec.priority}
                  </Badge>
                  {rec.effort && (
                    <Badge variant="secondary" className="text-[10px]">
                      {rec.effort}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rec.detail}</p>
                {rec.impact && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Expected impact: {rec.impact}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ToolResults;
