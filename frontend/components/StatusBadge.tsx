import { cn } from '@/lib/utils';
import { STATUS_BADGE, STATUS_DOT, STATUS_LABEL } from '@/lib/format';
import type { QueueStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: QueueStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        STATUS_BADGE[status],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}
