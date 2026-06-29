'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from './ui';
import { clearSecret, getSecret, setSecret } from '@/lib/auth';
import { queueApi } from '@/lib/api';

async function validate(): Promise<boolean> {
  if (!getSecret()) return false;
  try {
    await queueApi.history({});
    return true;
  } catch {
    return false;
  }
}

// ── Decorative background blobs (same palette as public hero) ─────
function Blobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <span className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent-purple/20 blur-3xl" />
      <span className="absolute -right-16 top-1/3 h-80 w-80 rounded-full bg-accent-sky/20 blur-3xl" />
      <span className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-pink/15 blur-3xl" />
      <span className="absolute right-1/4 -bottom-16 h-64 w-64 rounded-full bg-accent-purple/15 blur-3xl" />
    </div>
  );
}

// ── Full-page login screen ────────────────────────────────────────
function LoginPage({
  onLogin,
}: {
  onLogin: (secret: string) => Promise<string | null>;
}) {
  const [secret, setSecretInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const err = await onLogin(secret.trim());
    setBusy(false);
    if (err) setError(err);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas-soft px-4">
      <Blobs />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8">

        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary shadow-elevated">
            <span className="text-3xl font-extrabold text-white">Q</span>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold tracking-tight text-foreground">TA@CoE</p>
            <p className="mt-0.5 text-sm text-muted-foreground">ระบบจัดคิวตรวจ Checkpoint</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-widest text-primary">
              TA Console
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              กรอกรหัสผ่านที่ใช้ร่วมกันเพื่อจัดการคิว
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="secret" className="text-sm font-medium text-ink-secondary">
                รหัสผ่าน Admin
              </Label>
              <Input
                id="secret"
                type="password"
                value={secret}
                autoFocus
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="••••••••"
                className="h-10"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                <span className="text-xs text-destructive">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={busy || !secret.trim()}
              className="mt-1 h-10 w-full rounded-full text-sm font-semibold"
            >
              {busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>←</span>
          <span>กลับไปดูคิวนักศึกษา</span>
        </Link>
      </div>
    </div>
  );
}

// ── Gate component ────────────────────────────────────────────────
export function AdminGate({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    validate().then((ok) => setState(ok ? 'in' : 'out'));
  }, []);

  useEffect(() => {
    if (state === 'out' && redirectTo) {
      router.replace(redirectTo);
    }
  }, [state, redirectTo, router]);

  async function handleLogin(secret: string): Promise<string | null> {
    setSecret(secret);
    const ok = await validate();
    if (ok) {
      setState('in');
      return null;
    }
    clearSecret();
    return 'รหัสผ่าน Admin ไม่ถูกต้อง';
  }

  if (state === 'loading' || (state === 'out' && redirectTo)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-soft">
        <Spinner />
      </div>
    );
  }

  if (state === 'out') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <>{children}</>;
}

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        clearSecret();
        window.location.reload();
      }}
    >
      ออกจากระบบ
    </Button>
  );
}
