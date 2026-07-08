'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, CheckIcon } from 'lucide-react';

// ── Utilities ─────────────────────────────────────────────────────

const useIsoLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

function nodeToString(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join('');
  if (React.isValidElement(node)) {
    return nodeToString((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

function buildLabelMap(children: React.ReactNode): Map<string, string> {
  const map = new Map<string, string>();
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: string; children?: React.ReactNode };
    if (typeof props.value === 'string' && props.value !== '') {
      map.set(props.value, nodeToString(props.children));
    }
    if (props.children) {
      buildLabelMap(props.children).forEach((v, k) => map.set(k, v));
    }
  });
  return map;
}

// ── Context ───────────────────────────────────────────────────────

interface SelectCtxValue {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  open: boolean;
  setOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  labelMap: Map<string, string>;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const SelectCtx = React.createContext<SelectCtxValue>({
  value: '',
  onChange: () => {},
  open: false,
  setOpen: () => {},
  labelMap: new Map(),
  triggerRef: { current: null },
  contentRef: { current: null },
});

// ── Select ────────────────────────────────────────────────────────

function Select({
  value,
  onValueChange,
  disabled,
  children,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const labelMap = React.useMemo(() => buildLabelMap(children), [children]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // the dropdown is portaled outside rootRef, so check it separately
      if (rootRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <SelectCtx.Provider
      value={{
        value: value ?? '',
        onChange: onValueChange ?? (() => {}),
        disabled,
        open,
        setOpen,
        labelMap,
        triggerRef,
        contentRef,
      }}
    >
      <div ref={rootRef} className={cn('relative w-full min-w-0', open && 'z-30')}>
        {children}
      </div>
    </SelectCtx.Provider>
  );
}

// ── SelectTrigger ─────────────────────────────────────────────────

function SelectTrigger({
  className,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  size: _size,
  ...props
}: React.ComponentProps<'button'> & { size?: 'sm' | 'default' }) {
  const { value, disabled, open, setOpen, labelMap, triggerRef } =
    React.useContext(SelectCtx);

  let placeholder = 'เลือก';
  React.Children.forEach(children, (c) => {
    if (React.isValidElement(c)) {
      const p = c.props as { placeholder?: string };
      if (p.placeholder) placeholder = p.placeholder;
    }
  });

  const displayText = value ? (labelMap.get(value) ?? value) : '';

  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      onClick={() => setOpen((o) => !o)}
      className={cn(
        'flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm transition-colors outline-none',
        'hover:bg-muted/60',
        open
          ? 'border-ring ring-2 ring-ring/30'
          : 'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className={cn('truncate min-w-0 flex-1', displayText ? 'text-foreground' : 'text-muted-foreground')}>
        {displayText || placeholder}
      </span>
      <ChevronDownIcon
        className={cn(
          'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
          open && 'rotate-180',
        )}
      />
    </button>
  );
}

// ── SelectValue ───────────────────────────────────────────────────

function SelectValue({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  placeholder: _p,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className: _c,
}: {
  placeholder?: string;
  className?: string;
}) {
  return null;
}

// ── SelectContent ─────────────────────────────────────────────────

function SelectContent({
  className,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  side: _side,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sideOffset: _so,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  align: _align,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alignOffset: _ao,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alignItemWithTrigger: _ai,
  ...props
}: React.ComponentProps<'div'> & {
  side?: string;
  sideOffset?: number;
  align?: string;
  alignOffset?: number;
  alignItemWithTrigger?: boolean;
}) {
  const { open, triggerRef, contentRef } = React.useContext(SelectCtx);
  const [pos, setPos] = React.useState<React.CSSProperties | null>(null);

  // Position the portaled dropdown against the trigger's viewport rect, and
  // flip it above the trigger when there isn't enough room below. Recomputed on
  // scroll/resize so it tracks the trigger while open.
  useIsoLayoutEffect(() => {
    if (!open) return;
    const GAP = 4;
    const MAX = 256; // matches the old max-h-64

    function update() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      const above = r.top;
      const openUp = below < Math.min(MAX, 200) && above > below;
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
  }, [open, triggerRef]);

  if (!open || typeof document === 'undefined' || !pos) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="listbox"
      style={pos}
      className={cn(
        'z-[200] overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-elevated',
        className,
      )}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}

// ── SelectItem ────────────────────────────────────────────────────

function SelectItem({
  value: itemValue,
  children,
  className,
}: {
  value: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const { value, onChange, setOpen } = React.useContext(SelectCtx);
  const selected = value === itemValue;

  return (
    <div
      role="option"
      aria-selected={selected}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors',
        selected
          ? 'bg-primary/10 font-medium text-primary'
          : 'text-foreground hover:bg-muted',
        className,
      )}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => {
        onChange(itemValue);
        setOpen(false);
      }}
    >
      <span className="flex-1 truncate">{children}</span>
      {selected && <CheckIcon className="size-4 shrink-0 text-primary" />}
    </div>
  );
}

// ── SelectGroup / SelectLabel / SelectSeparator ───────────────────

function SelectGroup({ children }: { children?: React.ReactNode }) {
  return <div className="py-1">{children}</div>;
}

function SelectLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground', className)}
      {...props}
    />
  );
}

function SelectSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton(_props: Record<string, unknown>) { return null; }
function SelectScrollDownButton(_props: Record<string, unknown>) { return null; }

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
