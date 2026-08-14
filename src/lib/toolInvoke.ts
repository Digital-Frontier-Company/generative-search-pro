import { supabase } from '@/integrations/supabase/client';

export type ToolErrorKind =
  | 'auth'
  | 'validation'
  | 'timeout'
  | 'network'
  | 'rate_limit'
  | 'credits'
  | 'server'
  | 'unknown';

export class ToolError extends Error {
  kind: ToolErrorKind;
  retryable: boolean;
  status?: number;
  tool: string;

  constructor(tool: string, kind: ToolErrorKind, message: string, opts?: { retryable?: boolean; status?: number }) {
    super(message);
    this.name = 'ToolError';
    this.tool = tool;
    this.kind = kind;
    this.status = opts?.status;
    this.retryable = opts?.retryable ?? (kind !== 'auth' && kind !== 'validation');
  }
}

/**
 * Per-tool client-side timeouts.
 * Tools that call the AI gateway intentionally have NO timeout — generation can
 * legitimately run for minutes and aborting would discard billed work.
 */
export const TOOL_TIMEOUTS: Record<string, number | undefined> = {
  'enhanced-seo-analysis': 120_000,
  'analyze-competitors': 180_000,
  'optimize-content-for-ai': undefined,
  'generate-enhanced-content': undefined,
  'get-analytics-overview': 45_000,
  'get-analytics-trends': 45_000,
  'get-competitor-insights': 45_000,
  'get-realtime-metrics': 30_000,
  'export-analytics': 60_000,
};

const MESSAGES: Record<ToolErrorKind, string> = {
  auth: 'You need to be signed in to run this tool.',
  validation: 'Some of the inputs were rejected. Check the values and try again.',
  timeout: 'The tool took too long to respond. The site may be slow to crawl — try again.',
  network: 'Could not reach the analysis service. Check your connection and try again.',
  rate_limit: 'Too many requests right now. Wait a moment and try again.',
  credits: 'AI credits are exhausted. Add credits to keep using AI-powered tools.',
  server: 'The analysis service returned an error. Try again in a moment.',
  unknown: 'Something went wrong while running this tool.',
};

export function toolErrorMessage(kind: ToolErrorKind) {
  return MESSAGES[kind];
}

function classify(tool: string, error: any): ToolError {
  if (error instanceof ToolError) return error;

  const status: number | undefined =
    error?.status ?? error?.context?.status ?? error?.response?.status ?? undefined;
  const raw = String(error?.message || error || '');

  if (status === 401 || status === 403 || /auth|unauthor|jwt/i.test(raw)) {
    return new ToolError(tool, 'auth', MESSAGES.auth, { status, retryable: false });
  }
  if (status === 400 || status === 422) {
    return new ToolError(tool, 'validation', raw || MESSAGES.validation, { status, retryable: false });
  }
  if (status === 429) return new ToolError(tool, 'rate_limit', MESSAGES.rate_limit, { status });
  if (status === 402) return new ToolError(tool, 'credits', MESSAGES.credits, { status });
  if (/abort|timeout|timed out/i.test(raw)) return new ToolError(tool, 'timeout', MESSAGES.timeout, { status });
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return new ToolError(tool, 'network', MESSAGES.network, { status });
  }
  if (status && status >= 500) return new ToolError(tool, 'server', MESSAGES.server, { status });
  return new ToolError(tool, 'unknown', raw || MESSAGES.unknown, { status });
}

export interface InvokeToolOptions {
  /** Override the registry timeout. Pass null to disable timeouts entirely. */
  timeoutMs?: number | null;
  /** Require an authenticated session before invoking. Defaults to true. */
  requireAuth?: boolean;
}

/**
 * Consistent edge-function invocation: auth pre-check, timeout, and normalized errors.
 */
export async function invokeTool<T = any>(
  tool: string,
  body: Record<string, unknown>,
  options: InvokeToolOptions = {}
): Promise<T> {
  const { requireAuth = true } = options;
  const timeoutMs =
    options.timeoutMs === null ? undefined : options.timeoutMs ?? TOOL_TIMEOUTS[tool];

  let userId: string | undefined;
  if (requireAuth) {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) throw new ToolError(tool, 'auth', MESSAGES.auth, { retryable: false });
    userId = data.user.id;
  }

  const call = supabase.functions
    .invoke(tool, { body: JSON.stringify({ user_id: userId, ...body }) })
    .then(({ data, error }) => {
      if (error) throw classify(tool, error);
      if (data && typeof data === 'object' && 'error' in (data as any) && (data as any).error) {
        throw classify(tool, { message: String((data as any).error) });
      }
      return data as T;
    })
    .catch((e) => {
      throw classify(tool, e);
    });

  if (!timeoutMs) return call;

  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ToolError(tool, 'timeout', MESSAGES.timeout)), timeoutMs);
  });

  try {
    return await Promise.race([call, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
