import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { visibleNavGroups } from '@/components/shell/nav-items';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

/**
 * App shell: a fixed, flat sidebar on desktop, a slide-over on small screens,
 * and one measured content column so every page shares the same rhythm.
 */
export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const groups = visibleNavGroups(import.meta.env.DEV);
  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) => item.url === location.pathname);
  const sectionLabel = activeItem?.title ?? currentPageName ?? 'Dashboard';

  // Escape closes the slide-over; route changes close it too.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar
          groups={groups}
          currentPath={location.pathname}
          user={user}
          onSignOut={() => signOut()}
          LinkComponent={Link}
        />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
          />
          <div className="animate-fade-up absolute inset-y-0 left-0 w-[17rem] max-w-[85vw] shadow-pop">
            <Sidebar
              groups={groups}
              currentPath={location.pathname}
              user={user}
              onSignOut={() => signOut()}
              onNavigate={() => setMenuOpen(false)}
              LinkComponent={Link}
            />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar
          sectionLabel={sectionLabel}
          onOpenMenu={() => setMenuOpen(true)}
          primaryActionUrl={createPageUrl('Ideas')}
          LinkComponent={Link}
        />
        <main className="mx-auto w-full max-w-[1180px] px-5 py-7 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
