'use client';

import { useCallback, useEffect, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import Loading from '@/app/loading';
import { ScopePicker } from '@/components/ScopePicker';
import { EmptyState, Spinner } from '@/components/ui';
import { GlobeBackground } from '@/components/GlobeBackground';
import { queueApi } from '@/lib/api';
import { useScope } from '@/lib/useScope';
import { useRealtime } from '@/lib/useRealtime';
import { useKillSwitch } from '@/lib/useKillSwitch';
import { useMyQueueAlert } from '@/lib/useMyQueueAlert';
import type { QueueEntry } from '@/lib/types';
import { MousePointerClick, AlertTriangle, ServerCrash, RotateCw } from 'lucide-react';
import { EnqueueModal } from './EnqueueModal';
import { PageHeader } from './_components/PageHeader';
import { KillSwitchOverlay } from './_components/KillSwitchOverlay';
import { CheckingList } from './_components/CheckingList';
import { WaitingList } from './_components/WaitingList';
import { JoinFab } from './_components/JoinFab';
import { MyTurnBanner } from './_components/MyTurnBanner';
import { QueueSkeleton } from './_components/QueueSkeleton';

// The API runs on a free-tier host that sleeps when idle; a cold start can
// take a while, so past this threshold we say so instead of just spinning.
const SLOW_CONNECTION_MS = 4000;

export default function QueuePage() {
  const { subjects, labs, scope, setScope, loading: scopeLoading, reloadLabs } = useScope(true);
  const { queueDisabled, disabledMessage, handleSystem } = useKillSwitch();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) { setEntries([]); return; }
    setLoading(true);
    setConnError(null);
    const slowTimer = setTimeout(() => setSlow(true), SLOW_CONNECTION_MS);
    try {
      const data = await queueApi.active({
        subjectId: scope.subjectId,
        labId: scope.labId,
        checkpointId:
          scope.checkpointId && scope.checkpointId !== '__all__'
            ? scope.checkpointId
            : undefined,
      });
      setEntries(data);
    } catch (err) {
      setEntries([]);
      setConnError(err instanceof Error ? err.message : 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { reload(); }, [reload]);

  // Any realtime queue change may also affect lab state (e.g. a pause toggle), so refetch both.
  const handleChange = useCallback(() => {
    reload();
    reloadLabs();
  }, [reload, reloadLabs]);
  useRealtime(handleChange, handleSystem);

  const selectedLab = labs.find((l) => l._id === scope.labId);
  const ready = !!(scope.subjectId && scope.labId);
  const noActiveLab = !!scope.subjectId && !scopeLoading && labs.length === 0;
  const labPaused = !!selectedLab?.queuePaused;

  const checking = entries.filter((e) => e.status === 'checking');
  const waiting = entries.filter((e) => e.status === 'waiting');

  const { myStudentId, myEntry, isMyTurn } = useMyQueueAlert(entries);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <GlobeBackground />
      <NavBar />

      <main className="container-page relative z-10 flex w-full flex-1 flex-col gap-8 py-8">
        <PageHeader />

        <div className="relative z-20 rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-xl backdrop-blur-md">
          <ScopePicker subjects={subjects} labs={labs} scope={scope} onChange={setScope} />
        </div>

        {scopeLoading ? (
          <Loading />
        ) : noActiveLab ? (
          <EmptyState
            icon={<AlertTriangle className="h-5 w-5 text-zinc-400" />}
            title="ไม่มี Lab ที่เปิดใช้งานอยู่ขณะนี้"
            description="วิชานี้ยังไม่มี Lab ที่พร้อมใช้งาน กรุณารอ TA เปิด Lab"
          />
        ) : !ready ? (
          <EmptyState
            icon={<MousePointerClick className="h-5 w-5 text-zinc-400" />}
            title="เลือกวิชาและ Lab"
            description="ระบบจะแสดงคิวปัจจุบันทันทีที่คุณเลือก"
          />
        ) : loading && entries.length === 0 ? (
          slow ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 px-6 py-14 text-center backdrop-blur-sm animate-[fadeSlideUp_0.4s_ease_both]">
              <Spinner />
              <p className="text-sm font-medium text-zinc-300">กำลังปลุกเซิร์ฟเวอร์...</p>
              <p className="max-w-xs text-xs text-zinc-500">
                ระบบใช้ hosting ฟรี อาจใช้เวลาถึง 1 นาทีในการเชื่อมต่อครั้งแรก
              </p>
            </div>
          ) : (
            <QueueSkeleton />
          )
        ) : connError && entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-900/40 bg-red-950/10 px-6 py-14 text-center backdrop-blur-sm">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 border border-red-900/40">
              <ServerCrash className="h-5 w-5 text-red-400" />
            </span>
            <span className="text-base font-semibold text-white">เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ</span>
            <span className="max-w-sm text-xs text-zinc-400">{connError}</span>
            <button
              type="button"
              onClick={reload}
              className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800"
            >
              <RotateCw className="h-3.5 w-3.5" />
              ลองใหม่
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col gap-8">
            {queueDisabled && <KillSwitchOverlay message={disabledMessage} />}
            {isMyTurn && myEntry && <MyTurnBanner entry={myEntry} />}
            <CheckingList entries={checking} myStudentId={myStudentId} />
            <WaitingList entries={waiting} myStudentId={myStudentId} />
          </div>
        )}
      </main>

      <Footer />

      {ready && (
        <>
          <JoinFab
            paused={labPaused}
            pausedMessage={selectedLab?.pausedMessage}
            onOpen={() => setModalOpen(true)}
          />
          <EnqueueModal
            open={modalOpen && !labPaused}
            scope={scope}
            labs={labs}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
