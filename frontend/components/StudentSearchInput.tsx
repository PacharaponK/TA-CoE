'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/types';

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** The student's section in a given subject (empty if unknown/not enrolled). */
function sectionInSubject(s: Student, subjectId?: string): string {
  if (!subjectId) return '';
  return s.enrollments.find((e) => e.subjectId === subjectId)?.section ?? '';
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
  const [cursor, setCursor] = useState(-1);
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          s.studentId.includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          s.surname.toLowerCase().includes(q) ||
          s.nickname.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, students]);

  const showMenu = open && query.trim().length > 0;

  // Position the portaled menu against the input's viewport rect; flip up when
  // there's not enough room below. Recomputed on scroll/resize while open.
  useIsoLayoutEffect(() => {
    if (!showMenu) return;
    const GAP = 4;
    const MAX = 288;

    function update() {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const openUp = below < Math.min(MAX, 220) && above > below;
      const maxHeight = Math.min(MAX, Math.max(120, (openUp ? above : below) - GAP - 8));
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
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && cursor >= 0) { e.preventDefault(); pick(results[cursor]); }
    if (e.key === 'Escape') setOpen(false);
  }

  function pick(s: Student) {
    onSelect(s);
    setQuery('');
    setOpen(false);
    setCursor(-1);
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/40 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {selected.firstName} {selected.surname}
            {selected.nickname && (
              <span className="ml-1.5 font-normal text-muted-foreground">({selected.nickname})</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {selected.studentId}
            {sectionInSubject(selected, subjectId) && ` · Sec ${sectionInSubject(selected, subjectId)}`}
            {` · ปีที่ ${selected.year}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          aria-label="ล้าง"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoComplete="off"
        className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
      />
      {showMenu && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          style={pos}
          className="z-[200] overflow-y-auto rounded-xl border border-border bg-card shadow-elevated"
        >
          {results.length > 0 ? (
            results.map((s, i) => (
              <button
                key={s._id}
                type="button"
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
                    {s.firstName} {s.surname}
                    {s.nickname && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">({s.nickname})</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.studentId} · ปีที่ {s.year}{sectionInSubject(s, subjectId) ? ` · Sec ${sectionInSubject(s, subjectId)}` : ''}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground">ไม่พบนักศึกษาที่ตรงกัน</p>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
