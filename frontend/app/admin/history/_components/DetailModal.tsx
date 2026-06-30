'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { fmtDateTime } from '@/lib/format';
import type { QueueEntry } from '@/lib/types';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-zinc-900 pb-3">
      <span className="text-zinc-500 font-medium">{label}</span>
      <span className="col-span-2">{children}</span>
    </div>
  );
}

export function DetailModal({
  row,
  onClose,
}: {
  row: QueueEntry;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease_both]">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[scaleUp_0.2s_ease_both]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">รายละเอียดประวัติ</h2>
            <p className="text-xs text-zinc-400 mt-1">คิวตรวจของนักศึกษา</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-white rounded-full h-8 w-8 p-0"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-sm">
          <Row label="ชื่อนักศึกษา">
            <span className="text-white font-semibold">{row.studentName}</span>
          </Row>
          <Row label="รหัสนักศึกษา">
            <span className="text-zinc-300 font-mono">{row.studentId}</span>
          </Row>
          <Row label="Section">
            <span className="text-zinc-300">{row.section || '–'}</span>
          </Row>
          <Row label="วิชา">
            <span className="text-zinc-300">{row.subjectName}</span>
          </Row>
          <Row label="Lab">
            <span className="text-zinc-300">{row.labName}</span>
          </Row>
          <Row label="Checkpoint">
            <span className="text-zinc-300">{row.checkpointName ?? '–'}</span>
          </Row>
          <Row label="ตรวจครั้งที่">
            <span className="text-zinc-300">{row.attempt}</span>
          </Row>
          <Row label="ผลการตรวจ">
            <StatusBadge status={row.status} />
          </Row>
          <Row label="เวลาที่บันทึก">
            <span className="text-zinc-400">{fmtDateTime(row.resolvedAt)}</span>
          </Row>
          <div className="grid grid-cols-3 gap-2 pb-1">
            <span className="text-zinc-500 font-medium">ผู้ตรวจ (TA)</span>
            <span className="col-span-2 text-zinc-300">{row.resolvedBy || '–'}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-6"
            onClick={onClose}
          >
            ปิด
          </Button>
        </div>
      </div>
    </div>
  );
}
