'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { clearSecret } from '@/lib/auth';
import {
  LayoutList,
  History,
  BookOpen,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV = [
  { href: '/admin',          label: 'จัดการคิว',  icon: LayoutList, exact: true },
  { href: '/admin/history',  label: 'History',    icon: History,    exact: false },
  { href: '/admin/subjects', label: 'วิชา & Lab', icon: BookOpen,   exact: false },
  { href: '/admin/students', label: 'นักศึกษา',  icon: Users,      exact: false },
] as const;

function NavLinks({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();

  function active(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  function logout() {
    clearSecret();
    window.location.reload();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-zinc-800/70">
        <Link href="/admin" onClick={onNav} className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-7 w-7 rounded-lg object-cover transition-transform group-hover:scale-105"
          />
          <div>
            <p className="text-sm font-bold tracking-tight text-white">TA@CoE</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              TA Console
            </p>
          </div>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const isActive = active(href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-zinc-500',
                )}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: cross-role + logout */}
      <div className="border-t border-zinc-800/70 px-3 py-4 space-y-0.5">
        <Link
          href="/queue"
          onClick={onNav}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-white/5 hover:text-white transition-all duration-150"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          คิว (นักศึกษา)
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
        <NavLinks />
      </aside>

      {/* ── Mobile top bar (visible < md) ── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-zinc-800 bg-zinc-950/90 px-4 py-3 backdrop-blur-md md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="เปิดเมนู"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-5 w-5 rounded-md object-cover" />
          <span className="text-sm font-bold text-white">TA@CoE</span>
        </Link>
      </header>

      {/* ── Mobile drawer (slide in from left) ── */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      />
      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden',
          open ? 'flex translate-x-0' : 'flex -translate-x-full',
        )}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4">
          <Link href="/admin" onClick={close} className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 rounded-lg object-cover" />
            <span className="text-sm font-bold text-white">TA@CoE</span>
          </Link>
          <button
            onClick={close}
            aria-label="ปิดเมนู"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavLinks onNav={close} />
      </aside>
    </>
  );
}
