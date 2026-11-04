import { LogOut } from 'lucide-react';

import { Brand } from '@/components/shell/Brand';
import { cn } from '@/lib/utils';

function NavLink({ item, active, onNavigate, LinkComponent }) {
  const Icon = item.icon;
  return (
    <LinkComponent
      to={item.url}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 font-sans text-sm transition-colors',
        active
          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
      )}
    >
      {/* Active marker is a static rule, not a nudge — rows never shift. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-sidebar-primary transition-opacity',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.title}</span>
    </LinkComponent>
  );
}

export function Sidebar({ groups, currentPath, user, onSignOut, onNavigate, LinkComponent }) {
  const initial = (user?.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col gap-6 border-r border-sidebar-border bg-sidebar px-4 py-5">
      <Brand />

      <nav className="scroll-quiet flex flex-1 flex-col gap-5 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-2.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.title}
                item={item}
                active={currentPath === item.url}
                onNavigate={onNavigate}
                LinkComponent={LinkComponent}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-sans text-xs font-semibold text-accent-foreground"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-sans text-xs font-medium text-foreground" title={user?.email}>
              {user?.email ?? 'Signed in'}
            </p>
            <p className="font-sans text-[0.6875rem] text-muted-foreground">Account</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
