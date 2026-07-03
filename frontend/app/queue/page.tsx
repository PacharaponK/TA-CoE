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
import { MousePointerClick, AlertTriangle } from 'lucide-react';
import { EnqueueModal } from './EnqueueModal';
import { PageHeader } from './_components/PageHeader';
import { KillSwitchOverlay } from './_components/KillSwitchOverlay';
import { CheckingList } from './_components/CheckingList';
import { WaitingList } from './_components/WaitingList';
import { JoinFab } from './_components/JoinFab';
import { MyTurnBanner } from './_components/MyTurnBanner';

export default function QueuePage() {
  const { subjects, labs, scope, setScope, loading: scopeLoading, reloadLabs } = useScope(true);
  const { queueDisabled, disabledMessage, handleSystem } = useKillSwitch();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const reload = useCallback(async () => {
    if (!scope.subjectId || !scope.labId) { setEntries([]); return; }
    setLoading(true);
    try {
      setEntries(
        await queueApi.active({
          subjectId: scope.subjectId,
          labId: scope.labId,
          checkpointId:
            scope.checkpointId && scope.checkpointId !== '__all__'
              ? scope.checkpointId
              : undefined,
        }),
      );
    } catch {
      setEntries([]);
    } finally {
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
          <Spinner />
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
