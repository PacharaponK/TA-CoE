'use client';

import { useEffect, useState } from 'react';
import { StudentSearchInput } from '@/components/StudentSearchInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Field } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { queueApi } from '@/lib/api';
import type { Checkpoint, QueueEntry, Student } from '@/lib/types';

interface Scope {
  subjectId: string;
  labId: string;
  checkpointId: string;
}

export function EnqueueForm({
  scope,
  needsCheckpoint,
  checkpoints,
  students,
  entries,
  onEnqueued,
}: {
  scope: Scope;
  needsCheckpoint: boolean;
  checkpoints: Checkpoint[];
  students: Student[];
  entries: QueueEntry[];
  onEnqueued: () => void;
}) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [section, setSection] = useState('');
  const [checkpointId, setCheckpointId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const enrolled = selectedStudent?.enrollments.find(
      (e) => e.subjectId === scope.subjectId,
    );
    if (enrolled?.section) setSection(enrolled.section);
  }, [selectedStudent, scope.subjectId]);

  // seed the local checkpoint from the scope when it points at a specific one;
  // '__all__' or unset leaves it empty so the TA picks here
  useEffect(() => {
    setCheckpointId(
      scope.checkpointId && scope.checkpointId !== '__all__'
        ? scope.checkpointId
        : '',
    );
  }, [scope.checkpointId, scope.labId]);

  const effectiveCheckpoint = needsCheckpoint && checkpointId ? checkpointId : null;

  const alreadyIn = selectedStudent
    ? entries.some(
        (e) =>
          e.studentId === selectedStudent.studentId &&
          (!effectiveCheckpoint || e.checkpointId === effectiveCheckpoint),
      )
    : false;

  const canAdd =
    !!selectedStudent && !alreadyIn && (!needsCheckpoint || !!checkpointId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setError('');
    setBusy(true);
    try {
      await queueApi.enqueue({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId: effectiveCheckpoint,
        studentId: selectedStudent.studentId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.surname}`,
        section: section.trim() || undefined,
      });
      setSelectedStudent(null);
      setSection('');
      onEnqueued();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col gap-4 shadow-xl backdrop-blur-md">
      <div className="pb-1">
        <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">เพิ่มเข้าคิว</h2>
      </div>

      <Separator className="bg-white/5" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
        <div className="grid items-end gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <Field label="ค้นหานักศึกษา">
            <StudentSearchInput
              students={students}
              selected={selectedStudent}
              onSelect={setSelectedStudent}
              subjectId={scope.subjectId}
            />
          </Field>
          <Field label="Section">
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="01"
              className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
            />
          </Field>
          <Button
            type="submit"
            disabled={!canAdd || busy}
            className="self-end rounded-full bg-white text-black hover:bg-white/90 font-semibold"
          >
            {busy ? 'กำลังเพิ่ม…' : '+ เพิ่มเข้าคิว'}
          </Button>
        </div>

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

        {alreadyIn && selectedStudent && (
          <p className="flex items-center gap-1.5 text-sm text-amber-500">
            <span>⚠</span>
            {selectedStudent.firstName} {selectedStudent.surname} อยู่ในคิวแล้ว
          </p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
