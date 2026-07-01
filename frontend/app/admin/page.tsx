'use client';

import { useCallback, useEffect, useState } from 'react';
import Loading from '@/app/loading';
import { ScopePicker } from '@/components/ScopePicker';
import { EmptyState, Spinner } from '@/components/ui';
import { queueApi, studentsApi, systemConfigApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { useRealtime } from '@/lib/useRealtime';
import { useAction } from '@/lib/useAction';
import type { QueueEntry, Student } from '@/lib/types';
import { Search, Sparkles } from 'lucide-react';
import { QueueStats } from './_components/QueueStats';
import { QueueRow } from './_components/QueueRow';
import { EnqueueForm } from './_components/EnqueueForm';
import { KillSwitchCard } from './_components/KillSwitchCard';
import { LabPauseCard } from './_components/LabPauseCard';

function AdminQueue() {
  const { subjects, labs, scope, setScope, loading: scopeLoading, reloadLabs } = useScope(true);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // kill-switch state — updated via WebSocket broadcast
  const [queueDisabled, setQueueDisabled] = useState(false);
  const [disabledMessage, setDisabledMessage] = useState('');

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const needsCheckpoint = (selectedLab?.checkpoints?.length ?? 0) > 0;
  const ready = scope.subjectId && scope.labId;

  useEffect(() => {
    studentsApi.list(true).then(setStudents).catch(() => {});
  }, []);

  useEffect(() => {
    systemConfigApi.get().then((cfg) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
    }).catch(() => {});
  }, []);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) { setEntries([]); return; }
    setLoading(true);
    try {
      setEntries(await queueApi.active({ subjectId: scope.subjectId, labId: scope.labId }));
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [scope.subjectId, scope.labId]);

  useEffect(() => { reload(); }, [reload]);

  const handleSystem = useCallback(
    (cfg: { queueDisabled: boolean; disabledMessage: string }) => {
      setQueueDisabled(cfg.queueDisabled);
      setDisabledMessage(cfg.disabledMessage);
    },
    [],
  );

  const handleChange = useCallback(() => {
    reload();
    reloadLabs();
  }, [reload, reloadLabs]);

  useRealtime(handleChange, handleSystem);

  const run = useAction(reload, setError);

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8 relative z-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">จัดการคิว</h1>
        <p className="mt-1 text-sm text-zinc-400">เพิ่มนักศึกษาเข้าคิว เรียกตรวจ และบันทึกผล</p>
      </div>

      {/* Scope picker */}
      <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-xl backdrop-blur-md">
        <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
      </div>

      {scopeLoading ? (
        <Loading />
      ) : !ready ? (
        <EmptyState
          icon={<Search className="h-5 w-5 text-zinc-400" />}
          title="เลือกวิชาและ Lab ก่อน"
          description="เพื่อเริ่มเพิ่มนักศึกษาเข้าคิว"
        />
      ) : (
        <>
          <LabPauseCard lab={selectedLab} onChanged={reloadLabs} />

          <EnqueueForm
            scope={scope}
            needsCheckpoint={needsCheckpoint}
            students={students}
            entries={entries}
            onEnqueued={reload}
          />

          {/* Live queue */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
              <h2 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">คิวปัจจุบัน</h2>
              <QueueStats entries={entries} />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            {loading && entries.length === 0 ? (
              <Spinner />
            ) : entries.length === 0 ? (
              <EmptyState icon={<Sparkles className="h-5 w-5 text-zinc-400" />} title="ยังไม่มีคิว" />
            ) : (
              <div className="flex flex-col gap-2">
                {entries.map((e, i) => (
                  <QueueRow key={e._id} entry={e} index={i + 1} onAction={run} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <KillSwitchCard queueDisabled={queueDisabled} disabledMessage={disabledMessage} />
    </main>
  );
}

export default function AdminPage() {
  return <AdminQueue />;
}
