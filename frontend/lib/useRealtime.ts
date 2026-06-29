'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE } from './api';

/**
 * Subscribe to live queue changes. The backend emits `queue:changed`
 * whenever the queue or its config is mutated; we just re-run the
 * supplied callback (which refetches the current view).
 */
export function useRealtime(onChange: () => void) {
  const cbRef = useRef(onChange);
  cbRef.current = onChange;

  useEffect(() => {
    const socket: Socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
    });
    socket.on('queue:changed', () => cbRef.current());
    return () => {
      socket.off('queue:changed');
      socket.disconnect();
    };
  }, []);
}
