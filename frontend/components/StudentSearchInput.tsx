'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Student } from '@/lib/types';

export function StudentSearchInput({
  students,
  selected,
  onSelect,
  placeholder = 'ค้นหาชื่อ, รหัส, หรือชื่อเล่น…',
}: {
  students: Student[];
  selected: Student | null;
  onSelect: (s: Student | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
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
            {selected.section && ` · Sec ${selected.section}`}
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
    <div ref={containerRef} className={cn('relative', open && 'z-30')}>
      <Input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setCursor(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        autoComplete="off"
        className="border-white/10 bg-black/40 text-white placeholder-zinc-600 focus-visible:ring-zinc-500/30"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
          {results.map((s, i) => (
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
                  {s.studentId} · ปีที่ {s.year}{s.section ? ` · Sec ${s.section}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && query.trim() && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border bg-card px-4 py-3 shadow-elevated">
          <p className="text-sm text-muted-foreground">ไม่พบนักศึกษาที่ตรงกัน</p>
        </div>
      )}
    </div>
  );
}
