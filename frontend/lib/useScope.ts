'use client';

import { useCallback, useEffect, useState } from 'react';
import { labsApi, subjectsApi } from './api';
import type { Lab, Subject } from './types';
import type { Scope } from '@/components/ScopePicker';

export const EMPTY_SCOPE: Scope = {
  subjectId: '',
  labId: '',
  checkpointId: '',
};

/** Loads subjects, then labs for the selected subject. */
export function useScope(activeOnly = false) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [scope, setScope] = useState<Scope>(EMPTY_SCOPE);

  const reloadSubjects = useCallback(async () => {
    try {
      setSubjects(await subjectsApi.list(activeOnly));
    } catch {
      setSubjects([]);
    }
  }, [activeOnly]);

  const reloadLabs = useCallback(async () => {
    if (!scope.subjectId) {
      setLabs([]);
      return;
    }
    try {
      setLabs(await labsApi.list(scope.subjectId, activeOnly));
    } catch {
      setLabs([]);
    }
  }, [scope.subjectId, activeOnly]);

  useEffect(() => {
    reloadSubjects();
  }, [reloadSubjects]);

  useEffect(() => {
    reloadLabs();
  }, [reloadLabs]);

  return { subjects, labs, scope, setScope, reloadSubjects, reloadLabs };
}
