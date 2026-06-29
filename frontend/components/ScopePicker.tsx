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
          <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
            <SelectValue placeholder="เลือกวิชา" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
            {subjects.map((s) => (
              <SelectItem key={s._id} value={s._id} className="text-zinc-300 hover:bg-white/5 hover:text-white">
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
          <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
            <SelectValue placeholder="เลือก Lab" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
            {labs.map((l) => (
              <SelectItem key={l._id} value={l._id} className="text-zinc-300 hover:bg-white/5 hover:text-white">
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
            <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
              <SelectValue
                placeholder={checkpoints.length ? 'ทุก Checkpoint' : 'ไม่มี'}
              />
            </SelectTrigger>
            <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
              {checkpoints.length > 0 && (
                <SelectItem value="__all__" className="text-zinc-300 hover:bg-white/5 hover:text-white">ทุก Checkpoint</SelectItem>
              )}
              {checkpoints.map((c) => (
                <SelectItem key={c._id} value={c._id} className="text-zinc-300 hover:bg-white/5 hover:text-white">
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
