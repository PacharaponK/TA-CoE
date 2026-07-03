'use client';

import { useKillSwitch } from '@/lib/useKillSwitch';
import { useRealtime } from '@/lib/useRealtime';
import { useCurrentTa } from '@/lib/ta-context';
import { KillSwitchCard } from '../_components/KillSwitchCard';
import { TaAccountsCard } from './_components/TaAccountsCard';
import { Cog } from 'lucide-react';

function Settings() {
  const ta = useCurrentTa();
  const { queueDisabled, disabledMessage, handleSystem } = useKillSwitch();

  useRealtime(() => {}, handleSystem);

  if (ta && ta.role !== 'admin') {
    return (
      <main className="container-page flex w-full flex-1 flex-col items-center justify-center gap-2 py-8 text-center relative z-10">
        <h1 className="text-lg font-semibold text-white">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="text-sm text-zinc-400">หน้าตั้งค่าเปิดให้เฉพาะ Admin เท่านั้น</p>
      </main>
    );
  }

  return (
    <main className="container-page flex w-full flex-1 flex-col gap-8 py-8 relative z-10 animate-[fadeIn_0.5s_ease_both]">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/40 to-zinc-950 p-6 sm:p-8 shadow-2xl animate-[fadeSlideDown_0.6s_ease_both]">
        <div className="absolute top-0 right-0 h-48 w-48 bg-zinc-500/10 rounded-full blur-[80px]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 shadow-lg backdrop-blur-md">
              <Cog className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                ตั้งค่าระบบ
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                ควบคุมการทำงาน คิวสวิตช์ และสิทธิ์การเข้าถึง TA ของระบบ
              </p>
            </div>
          </div>
        </div>
      </div>

      <KillSwitchCard queueDisabled={queueDisabled} disabledMessage={disabledMessage} />
      <TaAccountsCard />
    </main>
  );
}

export default function SettingsPage() {
  return <Settings />;
}
