import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncActionState<TResult, TArgs extends readonly unknown[]> {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  reset: () => void;
  status: 'idle' | 'pending' | 'success' | 'error';
  loading: boolean;
  data: TResult | undefined;
  error: unknown;
}

export interface AsyncActionOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export function useAsyncAction<TResult, TArgs extends readonly unknown[]>(
  action: (...args: TArgs) => Promise<TResult>,
  options: AsyncActionOptions<TResult> = {},
): AsyncActionState<TResult, TArgs> {
  const [status, setStatus] = useState<AsyncActionState<TResult, TArgs>['status']>('idle');
  const [data, setData] = useState<TResult>();
  const [error, setError] = useState<unknown>();
  const mounted = useRef(true);
  const invocation = useRef(0);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const reset = useCallback(() => {
    invocation.current += 1;
    setStatus('idle');
    setData(undefined);
    setError(undefined);
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      const currentInvocation = invocation.current + 1;
      invocation.current = currentInvocation;
      setStatus('pending');
      setError(undefined);

      try {
        const result = await action(...args);
        if (mounted.current && invocation.current === currentInvocation) {
          setData(result);
          setStatus('success');
          optionsRef.current.onSuccess?.(result);
        }
        return result;
      } catch (caughtError) {
        if (mounted.current && invocation.current === currentInvocation) {
          setError(caughtError);
          setStatus('error');
          optionsRef.current.onError?.(caughtError);
        }
        return undefined;
      }
    },
    [action],
  );

  return {
    execute,
    reset,
    status,
    loading: status === 'pending',
    data,
    error,
  };
}
