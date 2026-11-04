import { cn } from '@/lib/utils';

/**
 * Every page opens the same way: eyebrow, serif title, one line of orientation,
 * actions on the right. Keeps headings from drifting per page.
 */
export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        {/* Wraps rather than truncates: a long title must stay readable on a phone. */}
        <h1 className="text-pretty break-words text-[1.75rem] font-semibold leading-tight md:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
