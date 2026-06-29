import type { QueueStatus } from './types';

export const STATUS_LABEL: Record<QueueStatus, string> = {
  waiting: 'รอ',
  checking: 'กำลังตรวจ',
  passed: 'ผ่าน',
  failed: 'ไม่ผ่าน',
};

// tinted badge classes — status dots use the decorative sticker palette
export const STATUS_BADGE: Record<QueueStatus, string> = {
  waiting: 'bg-zinc-900/50 text-zinc-400 border border-white/5',
  checking: 'bg-blue-500/10 text-primary border border-blue-500/20',
  passed: 'bg-accent-green/10 text-accent-green border border-accent-green/20',
  failed: 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20',
};

export const STATUS_DOT: Record<QueueStatus, string> = {
  waiting: 'bg-zinc-500',
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
