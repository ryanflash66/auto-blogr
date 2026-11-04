import { cn } from '@/lib/utils';

/**
 * One mark, one wordmark, no gradient. The old logo used a three-stop
 * emerald→amber gradient that clashed with every status colour on the page.
 */
export function Brand({ className, compact = false }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-serif text-base font-semibold leading-none text-primary-foreground"
      >
        A
      </span>
      <div className="min-w-0 leading-tight">
        <p className="font-serif text-[0.9375rem] font-semibold tracking-tight text-foreground">
          AutoBlogr
        </p>
        {compact ? null : (
          <p className="font-sans text-[0.6875rem] text-muted-foreground">Content workspace</p>
        )}
      </div>
    </div>
  );
}
