import { CheckCircle2, CircleDashed, Clock, FileText, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Canonical post/idea status chips: draft | generating | ready | published | scheduled.
 * Colour comes from the status tokens, so a status means the same thing on
 * every page and in both themes.
 */
const STATUS = {
  draft: { label: 'Draft', icon: CircleDashed, className: 'bg-status-draft-bg text-status-draft' },
  generating: {
    label: 'Generating',
    icon: Loader2,
    className: 'bg-status-generating-bg text-status-generating',
    spin: true,
  },
  ready: { label: 'Ready', icon: FileText, className: 'bg-status-ready-bg text-status-ready' },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    className: 'bg-status-published-bg text-status-published',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Clock,
    className: 'bg-status-scheduled-bg text-status-scheduled',
  },
};

export function StatusBadge({ status, className }) {
  const key = String(status ?? 'draft').toLowerCase();
  const meta = STATUS[key] ?? { ...STATUS.draft, label: key.replace(/[_-]/g, ' ') };
  const Icon = meta.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize',
        meta.className,
        className,
      )}
    >
      <Icon className={cn('h-3 w-3', meta.spin && 'animate-spin')} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export { STATUS as statusMeta };
