import { useCallback, useEffect, useRef, useState } from 'react';
import { ToolError, invokeTool, type InvokeToolOptions } from '@/lib/toolInvoke';

export type ToolRunStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseToolRunResult<T, A extends any[]> {
  status: ToolRunStatus;
  loading: boolean;
  data: T | null;
  error: ToolError | null;
  /** Seconds elapsed while a run is in flight — used for consistent progress copy. */
  elapsed: number;
  run: (...args: A) => Promise<T | null>;
  retry: () => Promise<T | null>;
  reset: () => void;
}

/**
 * Shared loading / timeout / error state machine for edge-function backed tools.
 */
export function useToolRun<T, A extends any[] = any[]>(
  tool: string,
  buildBody: (...args: A) => Record<string, unknown>,
  options: InvokeToolOptions & { onSuccess?: (data: T) => void; onError?: (error: ToolError) => void } = {}
): UseToolRunResult<T, A> {
  const [status, setStatus] = useState<ToolRunStatus>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ToolError | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const lastArgs = useRef<A | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status !== 'loading') return;
    setElapsed(0);
    const started = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [status]);

  const run = useCallback(
    async (...args: A) => {
      lastArgs.current = args;
      setStatus('loading');
      setError(null);
      try {
        const result = await invokeTool<T>(tool, buildBody(...args), options);
        if (!mounted.current) return result;
        setData(result);
        setStatus('success');
        options.onSuccess?.(result);
        return result;
      } catch (e) {
        const toolError = e as ToolError;
        if (!mounted.current) return null;
        setError(toolError);
        setStatus('error');
        options.onError?.(toolError);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tool]
  );

  const retry = useCallback(() => {
    if (!lastArgs.current) return Promise.resolve(null);
    return run(...lastArgs.current);
  }, [run]);

  const reset = useCallback(() => {
    setStatus('idle');
    setData(null);
    setError(null);
    setElapsed(0);
  }, []);

  return { status, loading: status === 'loading', data, error, elapsed, run, retry, reset };
}
