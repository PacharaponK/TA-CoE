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
  const [loading, setLoading] = useState(true);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  // Which subjects currently have at least one active lab — used so the
  // default subject selection below doesn't land on a subject with nothing
  // to show, forcing the viewer to search for the one that actually has one.
  const [subjectsWithLabs, setSubjectsWithLabs] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!activeOnly) {
      setSubjectsWithLabs(null);
      return;
    }
    (async () => {
      try {
        const activeLabs = await labsApi.list(undefined, true);
        setSubjectsWithLabs(new Set(activeLabs.map((l) => l.subjectId)));
      } catch {
        setSubjectsWithLabs(new Set());
      }
    })();
  }, [activeOnly]);

  const reloadSubjects = useCallback(async () => {
    setLoading(true);
    setSubjectsLoaded(false);
    try {
      const res = await subjectsApi.list(activeOnly);
      setSubjects(res);
      setSubjectsLoaded(true);
      if (res.length === 0) {
        setLoading(false);
      }
    } catch {
      setSubjects([]);
      setSubjectsLoaded(true);
      setLoading(false);
    }
  }, [activeOnly]);

  const reloadLabs = useCallback(async () => {
    if (!scope.subjectId) {
      setLabs([]);
      if (subjectsLoaded && subjects.length === 0) {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      setLabs(await labsApi.list(scope.subjectId, activeOnly));
    } catch {
      setLabs([]);
    } finally {
      setLoading(false);
    }
  }, [scope.subjectId, activeOnly, subjectsLoaded, subjects.length]);

  useEffect(() => {
    reloadSubjects();
  }, [reloadSubjects]);

  useEffect(() => {
    reloadLabs();
  }, [reloadLabs]);

  // Auto-select the first subject that actually has an active lab (so the
  // viewer lands on something to see), falling back to the first active
  // subject, then the first subject in the list.
  useEffect(() => {
    if (subjects.length > 0 && !scope.subjectId) {
      // Wait for the active-lab lookup so we don't pick a subject with
      // nothing in it before we know better.
      if (activeOnly && subjectsWithLabs === null) return;
      const subjectWithLab = subjectsWithLabs
        ? subjects.find((s) => subjectsWithLabs.has(s._id))
        : undefined;
      const activeSub =
        subjectWithLab || subjects.find((s) => s.isActive) || subjects[0];
      if (activeSub) {
        setScope((prev) => ({ ...prev, subjectId: activeSub._id }));
      }
    }
  }, [subjects, scope.subjectId, activeOnly, subjectsWithLabs]);

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

  return { subjects, labs, scope, setScope, loading, reloadSubjects, reloadLabs };
}
