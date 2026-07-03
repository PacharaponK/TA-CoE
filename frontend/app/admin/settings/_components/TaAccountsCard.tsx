'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, Field, Spinner } from '@/components/ui';
import { tasApi } from '@/lib/api';
import { useAction } from '@/lib/useAction';
import { confirmToast } from '@/lib/confirm-toast';
import { useCurrentTa } from '@/lib/ta-context';
import { cn } from '@/lib/utils';
import { UserCog } from 'lucide-react';
import type { TaAccount, TaRole } from '@/lib/types';
import { TaProfileFields, inputCn, normalizeProfileValues, type TaProfileValues } from '../../_components/TaProfileFields';

const selectCn = cn(
  'flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1',
  'text-sm text-white shadow-sm transition-colors outline-none',
  'focus:ring-1 focus:ring-zinc-500/30',
);

type TaFormData = {
  username: string;
  password: string; // '' on edit means "leave unchanged"
  displayName: string;
  role: TaRole;
} & TaProfileValues;

// ── Add / edit form ─────────────────────────────────────────────
function TaForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: TaAccount;
  onSubmit: (data: TaFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!initial;
  const [username, setUsername] = useState(initial?.username ?? '');
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [role, setRole] = useState<TaRole>(initial?.role ?? 'ta');
  const [password, setPassword] = useState('');

  const [profile, setProfile] = useState<TaProfileValues>({
    title: initial?.title ?? '',
    email: initial?.email ?? '',
    facebookName: initial?.facebookName ?? '',
    facebookUrl: initial?.facebookUrl ?? '',
    igName: initial?.igName ?? '',
    location: initial?.location ?? '',
    statusText: initial?.statusText ?? '',
    available: initial?.available ?? true,
    showOnContactPage: initial?.showOnContactPage ?? false,
    schedule: initial?.schedule ?? [],
  });

  const [busy, setBusy] = useState(false);

  const canSubmit =
    username.trim() && displayName.trim() && (isEdit || password.length >= 6);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        username: username.trim(),
        displayName: displayName.trim(),
        role,
        password,
        ...normalizeProfileValues(profile),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-xl">
      <CardContent className="pt-5">
        <p className="mb-4 text-sm font-semibold text-white">
          {isEdit ? `แก้ไขบัญชี ${initial!.username}` : 'เพิ่มบัญชี TA ใหม่'}
        </p>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="ชื่อผู้ใช้ *">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ta-somchai"
                disabled={isEdit}
                className={inputCn}
              />
            </Field>
            <Field label="ชื่อที่แสดง *">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="สมชาย ใจดี"
                className={inputCn}
              />
            </Field>
            <Field label="สิทธิ์ *">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as TaRole)}
                className={selectCn}
              >
                <option value="ta" className="bg-zinc-900">TA</option>
                <option value="admin" className="bg-zinc-900">Admin</option>
              </select>
            </Field>
          </div>

          <Field
            label={isEdit ? 'รีเซ็ตรหัสผ่าน' : 'รหัสผ่าน *'}
            hint={isEdit ? 'เว้นว่างไว้หากไม่ต้องการเปลี่ยน' : 'อย่างน้อย 6 ตัวอักษร'}
          >
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCn}
            />
          </Field>

          {/* Contact page profile */}
          <div className="flex flex-col gap-3 border-t border-zinc-800/70 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              โปรไฟล์หน้าติดต่อ (Contact)
            </p>
            <TaProfileFields value={profile} onChange={setProfile} />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={busy || !canSubmit}
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              {busy ? 'กำลังบันทึก…' : 'บันทึก'}
            </Button>
            <Button type="button" variant="ghost" className="text-zinc-500 hover:text-white" onClick={onCancel}>
              ยกเลิก
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Main card ─────────────────────────────────────────────────────
export function TaAccountsCard() {
  const me = useCurrentTa();
  const [tas, setTas] = useState<TaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTa, setEditTa] = useState<TaAccount | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTas(await tasApi.list());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const run = useAction(reload, setError);

  function openAdd() {
    setEditTa(null);
    setShowForm(true);
  }
  function openEdit(t: TaAccount) {
    setShowForm(false);
    setEditTa(t);
  }
  function closeForm() {
    setShowForm(false);
    setEditTa(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">บัญชี TA</h2>
          <p className="text-xs text-zinc-400">จัดการผู้ที่เข้าถึงระบบจัดการคิวได้ และโปรไฟล์หน้าติดต่อ</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/15 text-zinc-300 hover:bg-white/5 hover:text-white"
          onClick={showForm ? closeForm : openAdd}
        >
          {showForm ? 'ยกเลิก' : '+ เพิ่มบัญชี'}
        </Button>
      </div>

      {error && <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</p>}

      {showForm && (
        <TaForm
          onCancel={closeForm}
          onSubmit={async (data) => {
            const ok = await run(() => tasApi.create(data));
            if (ok) closeForm();
          }}
        />
      )}

      {loading ? (
        <Spinner />
      ) : tas.length === 0 ? (
        <EmptyState
          icon={<UserCog className="h-5 w-5 text-zinc-400" />}
          title="ยังไม่มีบัญชี TA"
          description='กด "+ เพิ่มบัญชี" เพื่อเริ่มต้น'
        />
      ) : (
        <div className="flex flex-col gap-2">
          {tas.map((t) =>
            editTa?._id === t._id ? (
              <TaForm
                key={t._id}
                initial={t}
                onCancel={closeForm}
                onSubmit={async (data) => {
                  const ok = await run(() =>
                    tasApi.update(t._id, {
                      displayName: data.displayName,
                      role: data.role,
                      ...(data.password ? { password: data.password } : {}),
                      title: data.title,
                      email: data.email,
                      facebookName: data.facebookName,
                      facebookUrl: data.facebookUrl,
                      igName: data.igName,
                      location: data.location,
                      statusText: data.statusText,
                      available: data.available,
                      showOnContactPage: data.showOnContactPage,
                      schedule: data.schedule,
                    }),
                  );
                  if (ok) closeForm();
                }}
              />
            ) : (
              <Card
                key={t._id}
                className={cn(
                  'transition-all duration-300 bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm hover:border-zinc-700',
                  !t.isActive && 'opacity-40',
                )}
              >
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {t.displayName}
                      {t._id === me?.id && (
                        <span className="ml-1.5 text-xs font-normal text-zinc-500">(คุณ)</span>
                      )}
                      {!t.isActive && <Badge variant="secondary" className="ml-2 text-xs bg-zinc-800 text-zinc-300">ปิดใช้งาน</Badge>}
                      {t.showOnContactPage && <Badge variant="secondary" className="ml-2 text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">Public</Badge>}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      @{t.username} ·{' '}
                      <span className={t.role === 'admin' ? 'text-blue-400' : 'text-zinc-400'}>
                        {t.role === 'admin' ? 'Admin' : 'TA'}
                      </span>
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                      แก้ไข
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => run(() => tasApi.update(t._id, { isActive: !t.isActive }))}
                    >
                      {t.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        confirmToast(`ลบบัญชี ${t.displayName} (@${t.username})?`, () => run(() => tasApi.remove(t._id)))
                      }
                    >
                      ลบ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
