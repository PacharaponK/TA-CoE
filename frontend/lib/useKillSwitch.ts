'use client';

import { useCallback, useEffect, useState } from 'react';
import { systemConfigApi } from './api';

/** Hydrates the system-wide kill-switch state and keeps it in sync via useRealtime's onSystem callback. */
export function useKillSwitch() {
  const [queueDisabled, setQueueDisabled] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState('');

  useEffect(() => {
    systemConfigApi.get().then((cfg) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
    }).catch(() => {});
  }, []);

  const handleSystem = useCallback(
    (cfg: { queueDisabled: boolean; disabledMessage: string }) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
    },
    [],
  );

  return { queueDisabled, disabledMessage, handleSystem };
}
