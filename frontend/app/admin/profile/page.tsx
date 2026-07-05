'use client';

import { useCallback, useEffect, useState } from 'react';
import { tasApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field, Spinner } from '@/components/ui';
import { TaProfileFields, inputCn, normalizeProfileValues, type TaProfileValues } from '../_components/TaProfileFields';
import type { TaAccount } from '@/lib/types';

const emptyProfile: TaProfileValues = {
  title: '',
  email: '',
  facebookName: '',
  facebookUrl: '',
  igName: '',
  location: '',
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
        title: data.title,
        email: data.email,
        facebookName: data.facebookName,
        facebookUrl: data.facebookUrl,
        igName: data.igName,
        location: data.location,
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
    <main className="container-page flex w-full flex-1 flex-col gap-6 py-8 relative z-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-sm text-zinc-400">แก้ไขข้อมูลที่แสดงในหน้าติดต่อ (Contact) ด้วยตัวเอง</p>
      </div>

      <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl">
        <CardContent className="pt-5">
          <form className="grid gap-5" onSubmit={handleSubmit}>
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

            <TaProfileFields value={profile} onChange={setProfile} />

            {error && <p className="text-sm text-red-400">{error}</p>}
            {saved && !error && <p className="text-sm text-emerald-400">บันทึกแล้ว</p>}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={busy || !displayName.trim()}
                className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
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
