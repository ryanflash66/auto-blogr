import { cn } from '@/lib/utils';

/**
 * A metric reads label-first, number-second, context-third. Flat surface and a
 * hairline border — the number is the only loud thing in the tile.
 */
export function StatTile({ label, value, hint, icon: Icon, emphasis = false, className }) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20',
        emphasis && 'border-primary/25 bg-accent/40',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <Icon
            className={cn('h-4 w-4 text-muted-foreground/70', emphasis && 'text-primary')}
            aria-hidden="true"
          />
        ) : null}
      </div>
      <p
        className={cn(
          'nums mt-3 font-serif text-[2.125rem] font-semibold leading-none',
          emphasis ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
