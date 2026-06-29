'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const links = isAdmin
    ? [
        { href: '/admin',            label: 'จัดการคิว' },
        { href: '/admin/subjects',   label: 'วิชา & Lab' },
        { href: '/admin/students',   label: 'นักศึกษา' },
        { href: '/admin/history',    label: 'History' },
        { href: '/queue',            label: 'คิว (นักศึกษา)' },
      ]
    : [
        { href: '/',                 label: 'หน้าแรก' },
        { href: '/queue',            label: 'คิวตรวจ' },
        { href: '/contact',          label: 'ติดต่อ TA' },
      ];

  return (
    <>
      {/* ── Mobile menu overlay ── */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/98 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden flex flex-col justify-center px-8',
          open ? 'h-screen opacity-100' : 'h-0 opacity-0 pointer-events-none',
        )}
      >
        <div className="absolute top-6 left-6 text-sm font-semibold tracking-tight text-white">
          TA@CoE
        </div>
        <div className="flex flex-col gap-8">
          <nav className="flex flex-col gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-3xl font-medium text-white/90 transition-colors hover:text-white"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          {!isAdmin && (
            <Link
              href="/queue"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-medium text-black transition-transform hover:scale-105"
            >
              ดูคิวปัจจุบัน
            </Link>
          )}
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg font-semibold tracking-tight text-white sm:text-xl shrink-0" onClick={() => setOpen(false)}>
            TA@CoE
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    active ? 'text-white' : 'text-white/70 hover:text-white',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && (
            <Link
              href="/queue"
              className="hidden rounded-lg bg-white px-5 py-2 text-sm font-medium text-black transition-transform hover:scale-105 md:block"
            >
              ดูคิว
            </Link>
          )}
          <button
            aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
            onClick={() => setOpen((o) => !o)}
            className="relative z-50 flex h-10 w-10 items-center justify-center text-white transition-transform active:scale-90 md:hidden"
          >
            <Menu size={22} className={cn('absolute transition-all duration-300',
              open ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100')} />
            <X size={22} className={cn('absolute transition-all duration-300',
              open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0')} />
          </button>
        </div>
      </nav>
    </>
  );
}
