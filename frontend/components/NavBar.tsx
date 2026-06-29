'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/queue',            label: 'คิว (นักศึกษา)' },
  { href: '/admin',            label: 'จัดการคิว' },
  { href: '/admin/subjects',   label: 'วิชา & Lab' },
  { href: '/admin/students',   label: 'นักศึกษา' },
  { href: '/admin/history',    label: 'History' },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-md">
        <div className="container-page flex h-14 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-black text-sm font-extrabold transition-transform group-hover:scale-105">
              Q
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-white sm:block">
              TA@CoE
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto py-1">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-300',
                    active
                      ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu toggle */}
          <button
            aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
            onClick={() => setOpen((o) => !o)}
            className="relative z-50 flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white transition-transform active:scale-95 md:hidden hover:bg-white/5"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Scrim Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-72 bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 p-6 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex flex-col gap-8">
          {/* Logo / Title */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-black text-sm font-extrabold">
                Q
              </span>
              <span className="text-sm font-semibold tracking-tight text-white">
                TA@CoE
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Vertical navigation links */}
          <nav className="flex flex-col gap-2">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)] border-l-2 border-blue-500 pl-3'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Info footer inside sidebar */}
        <div className="text-[10px] text-zinc-600 font-mono tracking-wider">
          CoE Queue System · Phase 1
        </div>
      </div>
    </>
  );
}
