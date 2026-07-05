'use client';

import * as React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, indeterminate, onCheckedChange, disabled, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    const active = checked || indeterminate;

    return (
      <span className={cn('relative inline-flex h-4 w-4 shrink-0 items-center justify-center', className)}>
        <input
          ref={innerRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer absolute inset-0 z-10 h-4 w-4 cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            'pointer-events-none flex h-4 w-4 items-center justify-center rounded-[4px] border transition-all duration-150',
            active
              ? 'border-white bg-white'
              : 'border-zinc-700 bg-zinc-950 peer-hover:border-zinc-500',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-500/40',
            disabled && 'opacity-40',
          )}
        >
          {indeterminate && !checked ? (
            <Minus className="h-3 w-3 text-black" strokeWidth={3} />
          ) : checked ? (
            <Check className="h-3 w-3 text-black" strokeWidth={3} />
          ) : null}
        </span>
      </span>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
