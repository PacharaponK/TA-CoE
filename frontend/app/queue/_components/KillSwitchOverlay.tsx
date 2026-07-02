import { AlertTriangle } from 'lucide-react';

export function KillSwitchOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-950/60 backdrop-blur-sm py-16 px-6 text-center animate-[fadeSlideUp_0.4s_ease_both]">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 border border-red-500/40">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </span>
      <div>
        <p className="text-base font-bold text-red-300">ระบบคิวปิดชั่วคราว</p>
        {message && <p className="mt-1 text-sm text-red-400/80">{message}</p>}
        <p className="mt-2 text-xs text-zinc-500">การเข้าคิวถูกระงับชั่วคราว กรุณารอประกาศจาก TA</p>
      </div>
    </div>
  );
}
