'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            Q
          </span>
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            TA@CoE
          </span>
        </Link>

        <div className="flex items-center gap-0.5 overflow-x-auto">
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
