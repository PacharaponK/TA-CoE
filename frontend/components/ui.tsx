'use client';

// Re-export shadcn primitives + define project-level composites on top.
// Keep shadcn components as the canonical source; this file adds
// app-specific variants (Field, EmptyState, Spinner) used across pages.

export {
  Button,
  buttonVariants,
} from '@/components/ui/button';

export {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';

export {
  Badge,
} from '@/components/ui/badge';

export { Input } from '@/components/ui/input';
export { Label } from '@/components/ui/label';
export { Separator } from '@/components/ui/separator';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';

// ── App-level composites ──────────────────────────────────────────

import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export function Field({
  label,
  children,
  hint,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5 min-w-0 w-full', className)}>
      <label className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon = <Inbox className="h-5 w-5 text-zinc-400" />,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md py-14 px-6 text-center shadow-lg animate-[fadeSlideUp_0.8s_ease_0.2s_both]">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/5 border border-zinc-800">
        {icon}
      </span>
      <span className="text-base font-semibold text-white">{title}</span>
      {description && (
        <span className="max-w-sm text-xs text-zinc-400">
          {description}
        </span>
      )}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-white" />
    </div>
  );
}

