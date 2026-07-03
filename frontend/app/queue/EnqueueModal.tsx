'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, Field } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentSearchInput } from '@/components/StudentSearchInput';
import { queueApi, studentsApi } from '@/lib/api';
import { setMyStudentId } from '@/lib/myQueue';
import { cn } from '@/lib/utils';
import type { Lab, Student } from '@/lib/types';

export interface EnqueueScope {
  subjectId: string;
  labId: string;
  /** '', '__all__', or a checkpoint id */
  checkpointId: string;
}

type Mode = 'search' | 'manual';

export function EnqueueModal({
  open,
  scope,
  labs,
  onClose,
}: {
  open: boolean;
  scope: EnqueueScope;
  labs: Lab[];
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>('search');

  // search mode
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);

  // manual mode
  const [mStudentId, setMStudentId] = useState('');
  const [mName, setMName] = useState('');
  const [mSection, setMSection] = useState('');

  // shared section override (search mode) + checkpoint
  const [section, setSection] = useState('');
  const [checkpointId, setCheckpointId] = useState<string>(
    scope.checkpointId === '__all__' ? '' : scope.checkpointId,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const checkpoints = selectedLab?.checkpoints ?? [];
  const needsCheckpoint = checkpoints.length > 0;

  // load students enrolled in this subject on open
  useEffect(() => {
    if (open && scope.subjectId) {
      studentsApi.list(true, scope.subjectId).then(setStudents).catch(() => { });
    }
  }, [open, scope.subjectId]);

  // sync checkpoint from parent scope; treat '__all__' as unset
  useEffect(() => {
    setCheckpointId(scope.checkpointId === '__all__' ? '' : scope.checkpointId);
  }, [scope.checkpointId]);

  // auto-fill section from selected student
  useEffect(() => {
    if (selected?.section) setSection(selected.section);
  }, [selected]);

  // close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function reset() {
    setMode('search');
    setSelected(null);
    setMStudentId('');
    setMName('');
    setMSection('');
    setSection('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  // effective checkpoint to send (null when "all" or not required)
  const effectiveCheckpoint =
    needsCheckpoint && checkpointId && checkpointId !== '__all__'
      ? checkpointId
      : null;

  // current values for submission depending on mode
  const data = mode === 'search'
    ? selected && {
      studentId: selected.studentId,
      studentName: `${selected.firstName} ${selected.surname}`.trim(),
      section: section.trim() || undefined,
    }
    : mStudentId.trim() && mName.trim()
      ? {
        studentId: mStudentId.trim(),
        studentName: mName.trim(),
        section: mSection.trim() || undefined,
      }
      : null;

  const canSubmit =
    !!data &&
    !submitting &&
    (!needsCheckpoint || (checkpointId && checkpointId !== '__all__'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError('');
    setSubmitting(true);
    try {
      await queueApi.join({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId: effectiveCheckpoint,
        studentId: data.studentId,
        studentName: data.studentName,
        section: data.section,
      });
      setMyStudentId(data.studentId);
      reset();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-elevated backdrop-blur-xl animate-[fadeSlideUp_0.3s_ease_both]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">เข้าร่วมคิว</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {selectedLab?.name ?? '—'}
              {effectiveCheckpoint &&
                ` · ${checkpoints.find((c) => c._id === effectiveCheckpoint)?.name}`}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          {/* mode toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-900/60 p-1">
            {(['search', 'manual'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  mode === m
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white',
                )}
              >
                {m === 'search' ? 'ค้นหาจากรายชื่อ' : 'กรอกเอง'}
              </button>
            ))}
          </div>

          {mode === 'search' ? (
            <>
              <Field label="ค้นหานักศึกษา">
                <StudentSearchInput
                  students={students}
                  selected={selected}
                  onSelect={setSelected}
                  placeholder="ค้นหาด้วยชื่อ, รหัสนักศึกษา"
                />
              </Field>

              {selected && (
                <Field label="Section">
                  <Input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="01"
                    className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                  />
                </Field>
              )}
            </>
          ) : (
            <>
              <Field label="รหัสนักศึกษา">
                <Input
                  value={mStudentId}
                  onChange={(e) => setMStudentId(e.target.value)}
                  placeholder="6301xxxxx"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
              <Field label="ชื่อ-นามสกุล">
                <Input
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  placeholder="ชื่อ นามสกุล"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
              <Field label="กลุ่มเรียน (Section)">
                <Input
                  value={mSection}
                  onChange={(e) => setMSection(e.target.value)}
                  placeholder="01 (ถ้ามี)"
                  className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
                />
              </Field>
            </>
          )}

          {/* checkpoint picker when needed */}
          {needsCheckpoint && (
            <Field label="Checkpoint">
              <Select
                value={checkpointId || undefined}
                onValueChange={(v) => setCheckpointId(v ?? '')}
              >
                <SelectTrigger className="w-full border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:bg-zinc-900/80 hover:text-white focus:border-zinc-500/50 transition-all duration-300">
                  <SelectValue placeholder="เลือก Checkpoint" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-xl">
                  {checkpoints.map((c) => (
                    <SelectItem
                      key={c._id}
                      value={c._id}
                      className="text-zinc-300 hover:bg-white/5 hover:text-white"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          {needsCheckpoint &&
            (!checkpointId || checkpointId === '__all__') && (
              <p className="text-xs text-orange-400">
                ⚠ Lab นี้ต้องระบุ Checkpoint
              </p>
            )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90"
          >
            {submitting ? 'กำลังเข้าร่วม…' : '+ เข้าร่วมคิว'}
          </Button>
        </form>
      </div>
    </div>
  );
}
