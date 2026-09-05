import { cn } from '@/lib/utils/cn';
import { bookingStatusStyles, statusLabel } from '@/lib/utils/format';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('badge', bookingStatusStyles[status] ?? 'bg-gray-100 text-gray-700')}>
      {statusLabel(status)}
    </span>
  );
}
