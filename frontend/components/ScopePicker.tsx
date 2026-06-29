'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field } from './ui';
import type { Lab, Subject } from '@/lib/types';

export interface Scope {
  subjectId: string;
  labId: string;
  checkpointId: string;
}

export function ScopePicker({
  subjects,
  labs,
  scope,
  onChange,
  includeCheckpoint = true,
}: {
  subjects: Subject[];
  labs: Lab[];
  scope: Scope;
  onChange: (next: Scope) => void;
  includeCheckpoint?: boolean;
}) {
  const selectedLab = labs.find((l) => l._id === scope.labId);
  const checkpoints = selectedLab?.checkpoints ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="วิชา">
        <Select
          value={scope.subjectId || undefined}
          onValueChange={(v) =>
            onChange({ subjectId: v ?? '', labId: '', checkpointId: '' })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="— เลือกวิชา —" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.code} · {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Lab">
        <Select
          value={scope.labId || undefined}
          disabled={!scope.subjectId}
          onValueChange={(v) =>
            onChange({ ...scope, labId: v ?? '', checkpointId: '' })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="— เลือก Lab —" />
          </SelectTrigger>
          <SelectContent>
            {labs.map((l) => (
              <SelectItem key={l._id} value={l._id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {includeCheckpoint && (
        <Field label="Checkpoint">
          <Select
            value={scope.checkpointId || undefined}
            disabled={!checkpoints.length}
            onValueChange={(v) =>
              onChange({ ...scope, checkpointId: v ?? '' })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={checkpoints.length ? 'ทุก Checkpoint' : '— ไม่มี —'}
              />
            </SelectTrigger>
            <SelectContent>
              {checkpoints.length > 0 && (
                <SelectItem value="__all__">ทุก Checkpoint</SelectItem>
              )}
              {checkpoints.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    </div>
  );
}
