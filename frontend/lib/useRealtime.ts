'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';
import type { SystemConfig } from './types';

/**
 * Subscribe to live queue changes. The backend emits `queue:changed`
 * whenever the queue or its config is mutated; we just re-run the
 * supplied callback (which refetches the current view).
 *
 * Also listens for `queue:system` (kill-switch toggle) events and calls
 * the optional `onSystem` callback with the new system config payload.
 */
export function useRealtime(
  onChange: () => void,
  onSystem?: (cfg: Pick<SystemConfig, 'queueDisabled' | 'disabledMessage'>) => void,
) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;
  const sysRef = useRef(onSystem);
  sysRef.current = onSystem;

  useEffect(() => {
    const socket: Socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
    });
    socket.on('queue:changed', (payload: Record<string, unknown>) => {
      // If this is actually a system event piggybacked on queue:changed, handle it
      if (payload?.type === 'system') {
        sysRef.current?.({
          queueDisabled: payload.queueDisabled as boolean,
          disabledMessage: (payload.disabledMessage as string) ?? '',
        });
      } else {
        cbRef.current();
      }
    });
    return () => {
      socket.off('queue:changed');
      socket.disconnect();
    };
  }, []);
}
