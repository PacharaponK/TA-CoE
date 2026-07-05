'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, UserCircle } from 'lucide-react';
import { tasApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Field, Spinner } from '@/components/ui';
import { TaProfileFields, inputCn, normalizeProfileValues, type TaProfileValues } from '../_components/TaProfileFields';
import type { TaAccount } from '@/lib/types';

const emptyProfile: TaProfileValues = {
  email: '',
  facebookName: '',
  facebookUrl: '',
  igName: '',
  statusText: '',
  telegramChatId: '',
  available: true,
  showOnContactPage: false,
  schedule: [],
};

function ProfilePage() {
  const [me, setMe] = useState<TaAccount | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [profile, setProfile] = useState<TaProfileValues>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasApi.getOwnProfile();
      setMe(data);
      setDisplayName(data.displayName);
      setProfile({
        email: data.email,
        facebookName: data.facebookName,
        facebookUrl: data.facebookUrl,
        igName: data.igName,
        statusText: data.statusText,
        telegramChatId: data.telegramChatId,
        available: data.available,
        showOnContactPage: data.showOnContactPage,
        schedule: data.schedule,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await tasApi.updateOwnProfile({
        displayName: displayName.trim(),
        ...normalizeProfileValues(profile),
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="container-page flex w-full flex-1 items-center justify-center py-8 relative z-10">
        <Spinner />
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
              <UserCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                โปรไฟล์ของฉัน
              </h1>
              <p className="mt-1.5 text-sm text-zinc-400 font-medium">
                แก้ไขข้อมูลที่แสดงในหน้าติดต่อ (Contact) ด้วยตัวเอง
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-md shadow-xl animate-[fadeSlideUp_0.6s_ease_0.1s_both]">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">ข้อมูลบัญชี</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="ชื่อผู้ใช้">
                  <Input value={me?.username ?? ''} disabled className={inputCn} />
                </Field>
                <Field label="ชื่อที่แสดง *">
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputCn}
                  />
                </Field>
              </div>
            </section>

            <Separator className="bg-white/5" />

            <TaProfileFields value={profile} onChange={setProfile} />

            {error && (
              <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>
            )}
            {saved && !error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                บันทึกแล้ว
              </p>
            )}

            <div className="flex gap-2 border-t border-white/5 pt-5">
              <Button
                type="submit"
                disabled={busy || !displayName.trim()}
                className="rounded-full bg-white px-6 font-semibold text-black hover:bg-white/90"
              >
                {busy ? 'กำลังบันทึก…' : 'บันทึก'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AdminProfilePage() {
  return <ProfilePage />;
}
