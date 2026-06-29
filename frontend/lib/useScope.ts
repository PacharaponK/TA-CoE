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

  // Auto-select first active subject (fallback to first subject in list)
  useEffect(() => {
    if (subjects.length > 0 && !scope.subjectId) {
      const activeSub = subjects.find((s) => s.isActive) || subjects[0];
      if (activeSub) {
        setScope((prev) => ({ ...prev, subjectId: activeSub._id }));
      }
    }
  }, [subjects, scope.subjectId]);

  // Auto-select first active lab (fallback to first lab in list)
  useEffect(() => {
    if (labs.length > 0 && scope.subjectId && !scope.labId) {
      const activeLab = labs.find((l) => l.isActive) || labs[0];
      if (activeLab) {
        const defaultCheckpoint = activeLab.checkpoints && activeLab.checkpoints.length > 0
          ? '__all__'
          : '';
        setScope((prev) => ({
          ...prev,
          labId: activeLab._id,
          checkpointId: defaultCheckpoint,
        }));
      }
    }
  }, [labs, scope.subjectId, scope.labId]);

  // Auto-select default checkpoint when lab is manually switched
  useEffect(() => {
    if (scope.labId && !scope.checkpointId) {
      const currentLab = labs.find((l) => l._id === scope.labId);
      if (currentLab) {
        const defaultCheckpoint = currentLab.checkpoints && currentLab.checkpoints.length > 0
          ? '__all__'
          : '';
        setScope((prev) => ({ ...prev, checkpointId: defaultCheckpoint }));
      }
    }
  }, [scope.labId, scope.checkpointId, labs]);

  return { subjects, labs, scope, setScope, reloadSubjects, reloadLabs };
}
