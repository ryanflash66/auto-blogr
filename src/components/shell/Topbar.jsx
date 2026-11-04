import { Menu, Plus } from 'lucide-react';

import { Brand } from '@/components/shell/Brand';
import { ThemeToggle } from '@/components/shell/ThemeToggle';
import { Button } from '@/components/ui/button';

/**
 * A thin, sticky bar: where you are on the left, the one global action and the
 * theme switch on the right. No faux search field, no duplicated page title on
 * desktop — the page header owns that.
 */
export function Topbar({ sectionLabel, onOpenMenu, primaryActionUrl, LinkComponent }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-3 px-5 md:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="lg:hidden">
          <Brand compact />
        </div>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 lg:flex">
          <span className="font-sans text-sm text-muted-foreground">Workspace</span>
          <span aria-hidden="true" className="text-muted-foreground/50">
            /
          </span>
          <span className="truncate font-sans text-sm font-medium text-foreground">
            {sectionLabel}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="h-8">
            <LinkComponent to={primaryActionUrl}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New idea
            </LinkComponent>
          </Button>
        </div>
      </div>
    </header>
  );
}
