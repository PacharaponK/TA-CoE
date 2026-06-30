'use client';

import { useCallback } from 'react';

/**
 * Returns a `run` helper that clears the error state, calls `fn`, reloads,
 * and catches any thrown error — returning true on success, false on failure.
 */
export function useAction(
  reload: () => Promise<void>,
  setError: (msg: string) => void,
) {
  return useCallback(
    async (fn: () => Promise<unknown>): Promise<boolean> => {
      setError('');
      try {
        await fn();
        await reload();
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      }
    },
    [reload, setError],
  );
}
