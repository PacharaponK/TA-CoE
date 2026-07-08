'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/types';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const MAX_RESULTS = 50;

/** The student's section in a given subject (empty if unknown/not enrolled). */
function sectionInSubject(s: Student, subjectId?: string): string {
  if (!subjectId) return '';
  return s.enrollments.find((e) => e.subjectId === subjectId)?.section ?? '';
}

/** Wrap the first case-insensitive occurrence of `q` in a highlight mark. */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-primary/25 px-0.5 text-primary">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function StudentSearchInput({
  students,
  selected,
  onSelect,
  subjectId,
  placeholder = 'ค้นหาชื่อ, รหัส, หรือชื่อเล่น…',
}: {
  students: Student[];
  selected: Student | null;
  onSelect: (s: Student | null) => void;
  /** When set, section shown next to a student is their section in this subject. */
  subjectId?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  // Filtered + ranked list. With no query we show everyone (browse mode) so a
  // TA can just pick from the list without typing.
  const { results, total } = useMemo(() => {
    const matched = q
      ? students.filter(
          (s) =>
            s.studentId.includes(q) ||
            s.firstName.toLowerCase().includes(q) ||
            s.surname.toLowerCase().includes(q) ||
            s.nickname.toLowerCase().includes(q),
        )
      : students;

    const rank = (s: Student) =>
      q &&
      (s.firstName.toLowerCase().startsWith(q) ||
        s.nickname.toLowerCase().startsWith(q) ||
        s.studentId.startsWith(q))
        ? 0
        : 1;

    const sorted = [...matched].sort(
      (a, b) =>
        rank(a) - rank(b) || a.firstName.localeCompare(b.firstName, 'th'),
    );

    return { results: sorted.slice(0, MAX_RESULTS), total: matched.length };
  }, [q, students]);

  const showMenu = open && (results.length > 0 || q.length > 0);

  // reset the highlighted row whenever the result set changes
  useEffect(() => {
    setCursor(results.length ? 0 : -1);
  }, [results]);

  // keep the highlighted row scrolled into view during keyboard nav
  useEffect(() => {
    if (cursor < 0) return;
    const el = menuRef.current?.querySelector(
      `[data-idx="${cursor}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  // Position the portaled menu against the input's viewport rect; flip up when
  // there's not enough room below. Recomputed on scroll/resize while open.
  useIsoLayoutEffect(() => {
    if (!showMenu) return;
    const GAP = 4;
    const MAX = 340;

    function update() {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const openUp = below < Math.min(MAX, 240) && above > below;
      const maxHeight = Math.min(MAX, Math.max(160, (openUp ? above : below) - GAP - 8));
      setPos({
        position: 'fixed',
        left: r.left,
        width: r.width,
        maxHeight,
        ...(openUp
          ? { bottom: window.innerHeight - r.top + GAP }
          : { top: r.bottom + GAP }),
      });
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showMenu]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => Math.min(c + 1, results.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
      return;
    }
    if (e.key === 'Enter' && cursor >= 0 && results[cursor]) {
      e.preventDefault();
      pick(results[cursor]);
      return;
    }
    if (e.key === 'Escape') setOpen(false);
  }

  function pick(s: Student) {
    onSelect(s);
    setQuery('');
    setOpen(false);
    setCursor(0);
  }

  if (selected) {
    const sec = sectionInSubject(selected, subjectId);
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {selected.firstName.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {selected.firstName} {selected.surname}
            {selected.nickname && (
              <span className="ml-1.5 font-normal text-muted-foreground">({selected.nickname})</span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {selected.studentId}
            {sec && ` · Sec ${sec}`}
            {` · ปีที่ ${selected.year}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="ล้าง"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showMenu}
        className="border-white/10 bg-black/40 pl-9 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
      />
      {showMenu && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={pos}
          role="listbox"
          className="z-[200] flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevated"
        >
          {/* count header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">
              {results.length === 0
                ? 'ไม่พบนักศึกษาที่ตรงกัน'
                : q
                  ? `พบ ${total} คน`
                  : `นักศึกษาทั้งหมด ${total} คน`}
            </span>
            {total > results.length && (
              <span className="text-[11px] text-muted-foreground/70">
                แสดง {results.length} · พิมพ์เพื่อค้นหา
              </span>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {results.length > 0 ? (
              results.map((s, i) => {
                const sec = sectionInSubject(s, subjectId);
                return (
                  <button
                    key={s._id}
                    data-idx={i}
                    type="button"
                    role="option"
                    aria-selected={cursor === i}
                    onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                    onMouseEnter={() => setCursor(i)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                      cursor === i ? 'bg-muted' : 'hover:bg-muted/60',
                      i > 0 && 'border-t border-border/60',
                    )}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {s.firstName.charAt(0)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        <Highlight text={`${s.firstName} ${s.surname}`} q={q} />
                        {s.nickname && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            (<Highlight text={s.nickname} q={q} />)
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        <Highlight text={s.studentId} q={q} /> · ปีที่ {s.year}
                      </p>
                    </div>
                    {sec && (
                      <span className="shrink-0 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Sec {sec}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">ไม่พบนักศึกษาที่ตรงกัน</p>
                <p className="mt-0.5 text-xs text-muted-foreground/70">ลองพิมพ์ชื่อหรือรหัสอื่น</p>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
