import { ReactNode } from "react";
import { Loader2, Play, RotateCcw, Download, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDomain } from "@/contexts/DomainContext";
import { cn } from "@/lib/utils";

export interface ToolShellProps {
  title: string;
  description: string;
  icon?: ReactNode;
  badge?: string;
  /** Show the domain field, bound to the global active domain. */
  usesDomain?: boolean;
  domain?: string;
  onDomainChange?: (value: string) => void;
  /** Extra inputs rendered under the domain row. */
  controls?: ReactNode;
  loading?: boolean;
  error?: string | null;
  hasResults?: boolean;
  emptyState?: ReactNode;
  runLabel?: string;
  onRun?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  children?: ReactNode;
}

/**
 * Shared chrome for every analysis tool: title block, input row,
 * run/reset/export actions and consistent loading / error / empty states.
 */
const ToolShell = ({
  title,
  description,
  icon,
  badge,
  usesDomain,
  domain,
  onDomainChange,
  controls,
  loading,
  error,
  hasResults,
  emptyState,
  runLabel = "Run analysis",
  onRun,
  onReset,
  onExport,
  children,
}: ToolShellProps) => {
  const { defaultDomain } = useDomain();
  const value = domain ?? defaultDomain ?? "";

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge && <Badge variant="secondary">{badge}</Badge>}
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      {(usesDomain || controls || onRun) && (
        <Card>
          <CardContent className="space-y-4 p-4">
            {usesDomain && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={value}
                    onChange={(e) => onDomainChange?.(e.target.value)}
                    placeholder="example.com"
                    className="pl-9"
                    aria-label="Domain to analyze"
                  />
                </div>
                {onRun && (
                  <Button onClick={onRun} disabled={loading} className="sm:w-auto">
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="mr-2 h-4 w-4" />
                    )}
                    {loading ? "Running…" : runLabel}
                  </Button>
                )}
              </div>
            )}

            {controls}

            {!usesDomain && onRun && (
              <Button onClick={onRun} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {loading ? "Running…" : runLabel}
              </Button>
            )}

            {(onReset || onExport) && hasResults && (
              <div className="flex gap-2">
                {onReset && (
                  <Button variant="outline" size="sm" onClick={onReset}>
                    <RotateCcw className="mr-2 h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
                {onExport && (
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Export JSON
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base">Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {loading && !hasResults && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {!loading && !error && !hasResults && (
        <Card className="border-dashed">
          <CardContent className={cn("py-12 text-center text-sm text-muted-foreground")}>
            {emptyState ?? "Run the tool to see results here."}
          </CardContent>
        </Card>
      )}

      {hasResults && children}
    </div>
  );
};

export default ToolShell;
