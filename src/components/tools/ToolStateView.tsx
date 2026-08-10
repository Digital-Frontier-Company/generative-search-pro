import { AlertTriangle, Clock, Loader2, LogIn, RefreshCw, WifiOff, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ToolError, ToolErrorKind } from '@/lib/toolInvoke';

const ICONS: Record<ToolErrorKind, React.ComponentType<{ className?: string }>> = {
  auth: LogIn,
  validation: AlertTriangle,
  timeout: Clock,
  network: WifiOff,
  rate_limit: Clock,
  credits: Zap,
  server: AlertTriangle,
  unknown: AlertTriangle,
};

const TITLES: Record<ToolErrorKind, string> = {
  auth: 'Sign in required',
  validation: 'Check your input',
  timeout: 'Timed out',
  network: 'Connection problem',
  rate_limit: 'Slow down',
  credits: 'Out of AI credits',
  server: 'Service error',
  unknown: 'Something went wrong',
};

interface ToolLoadingProps {
  label?: string;
  elapsed?: number;
  rows?: number;
}

export function ToolLoading({ label = 'Running analysis', elapsed = 0, rows = 3 }: ToolLoadingProps) {
  const hint =
    elapsed > 45
      ? 'Still working — deep crawls can take a couple of minutes.'
      : elapsed > 15
        ? 'Fetching and scoring the live page…'
        : 'Contacting the analysis service…';

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">
              {hint} {elapsed > 0 && `(${elapsed}s)`}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ToolErrorViewProps {
  error: ToolError;
  onRetry?: () => void;
  onSignIn?: () => void;
}

export function ToolErrorView({ error, onRetry, onSignIn }: ToolErrorViewProps) {
  const Icon = ICONS[error.kind] ?? AlertTriangle;

  return (
    <Card className="border-destructive/40">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 text-destructive mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium">{TITLES[error.kind] ?? TITLES.unknown}</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {error.kind === 'auth' && onSignIn && (
            <Button size="sm" onClick={onSignIn}>
              Sign in
            </Button>
          )}
          {error.retryable && onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolEmpty({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-muted-foreground text-sm">{message}</CardContent>
    </Card>
  );
}
