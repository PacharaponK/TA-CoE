'use client';

import { createContext, useContext } from 'react';
import type { CurrentTa } from './types';

export const TaContext = createContext<CurrentTa | null>(null);

/** The logged-in TA's identity. Only meaningful inside <AdminGate>. */
export function useCurrentTa(): CurrentTa | null {
  return useContext(TaContext);
}
