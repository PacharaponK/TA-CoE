'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLoggedIn } from '@/lib/auth';

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => { setLoggedIn(isLoggedIn()); }, [pathname]);

  const isAdmin = pathname.startsWith('/admin');
  const adminLinks = [
    { href: '/admin', label: 'จัดการคิว' },
    { href: '/admin/history', label: 'History' },
    { href: '/admin/subjects', label: 'วิชา & Lab' },
    { href: '/admin/students', label: 'นักศึกษา' },
  ];
  const links = isAdmin
    ? adminLinks
    : [
      { href: '/', label: 'หน้าแรก' },
      { href: '/queue', label: 'คิวตรวจ' },
      { href: '/contact', label: 'ติดต่อ TA' },
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
        <div className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <img src="/logo.png" alt="Logo" className="h-5 w-5 object-cover rounded-sm" />
          <span>TA@CoE</span>
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

          {isAdmin ? (
            /* ── Admin: student-view link separated by a rule ── */
            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/30">มุมมองนักศึกษา</p>
              <Link
                href="/queue"
                onClick={() => setOpen(false)}
                className="text-xl font-medium text-white/50 transition-colors hover:text-white/80"
              >
                คิว (นักศึกษา) →
              </Link>
            </div>
          ) : (
            <>
              <Link
                href="/queue"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-medium text-black transition-transform hover:scale-105"
              >
                ดูคิวปัจจุบัน
              </Link>
              {loggedIn && (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/30">TA Console</p>
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-xl font-medium text-white/50 transition-colors hover:text-white/80"
                  >
                    จัดการคิว →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <nav className="relative z-30 flex items-center justify-between px-6 py-5 md:px-12 lg:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white sm:text-xl shrink-0 group" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-cover rounded-md transition-transform group-hover:scale-105" />
            <span>TA@CoE</span>
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

            {/* ── Separator + cross-role link ── */}
            {(isAdmin || loggedIn) && (
              <>
                <span className="h-4 w-px bg-white/15" aria-hidden />
                {isAdmin ? (
                  <Link
                    href="/queue"
                    className="text-sm font-medium text-white/35 transition-colors duration-200 hover:text-white/60"
                  >
                    คิว (นักศึกษา) ↗
                  </Link>
                ) : (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-white/35 transition-colors duration-200 hover:text-white/60"
                  >
                    TA Console ↗
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAdmin && !loggedIn && (
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
