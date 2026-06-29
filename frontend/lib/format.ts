import type { QueueStatus } from './types';

export const STATUS_LABEL: Record<QueueStatus, string> = {
  waiting: 'รอ',
  checking: 'กำลังตรวจ',
  passed: 'ผ่าน',
  failed: 'ไม่ผ่าน',
};

// tinted badge classes — status dots use the decorative sticker palette
export const STATUS_BADGE: Record<QueueStatus, string> = {
  waiting: 'bg-canvas-soft text-ink-muted border border-hairline',
  checking: 'bg-[#e7f1fc] text-primary border border-[#cfe3f9]',
  passed: 'bg-[#e8f7eb] text-accent-green border border-[#cdeed4]',
  failed: 'bg-[#fdf0e8] text-accent-orange border border-[#f6dcc9]',
};

export const STATUS_DOT: Record<QueueStatus, string> = {
  waiting: 'bg-ink-faint',
  checking: 'bg-primary',
  passed: 'bg-accent-green',
  failed: 'bg-accent-orange',
};

export function fmtTime(d?: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtDateTime(d?: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleString('th-TH', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function waitedMinutes(from: string) {
  const mins = Math.floor((Date.now() - new Date(from).getTime()) / 60000);
  if (mins < 1) return 'เพิ่งเข้าคิว';
  if (mins < 60) return `รอมา ${mins} นาที`;
  const h = Math.floor(mins / 60);
  return `รอมา ${h} ชม. ${mins % 60} นาที`;
}
