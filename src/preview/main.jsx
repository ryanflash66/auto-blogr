import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';

import '@/index.css';

import { DashboardView } from '@/components/dashboard/DashboardView';
import IdeaList from '@/components/ideas/IdeaList';
import PostCard from '@/components/posts/PostCard';
import { Sidebar } from '@/components/shell/Sidebar';
import { Topbar } from '@/components/shell/Topbar';
import { visibleNavGroups } from '@/components/shell/nav-items';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/lib/theme';
import {
  emptyDashboard,
  mockIdeas,
  mockPosts,
  mockUser,
  populatedDashboard,
} from '@/preview/mock-data';

const VIEWS = ['Dashboard', 'Ideas', 'Posts'];

/**
 * Dev-only harness: renders the real shell and the real DashboardView against
 * fixtures, so the design can be reviewed at /preview.html without signing in.
 */
function PreviewApp() {
  const [showEmpty, setShowEmpty] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('Dashboard');
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const groups = visibleNavGroups(true);
  const data = showEmpty ? emptyDashboard : populatedDashboard;
  const ideas = showEmpty ? [] : mockIdeas;
  const posts = showEmpty ? [] : mockPosts;

  // The shell links with react-router <Link>; a plain anchor keeps the harness
  // from navigating away from the preview page.
  const PreviewLink = ({ to, children, ...props }) => (
    <a href="#preview" data-to={to} {...props}>
      {children}
    </a>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar
          groups={groups}
          currentPath="/dashboard"
          user={mockUser}
          onSignOut={() => {}}
          LinkComponent={PreviewLink}
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
              currentPath="/dashboard"
              user={mockUser}
              onSignOut={() => {}}
              onNavigate={() => setMenuOpen(false)}
              LinkComponent={PreviewLink}
            />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar
          sectionLabel={view}
          onOpenMenu={() => setMenuOpen(true)}
          primaryActionUrl="/ideas"
          LinkComponent={PreviewLink}
        />
        <main className="mx-auto w-full max-w-[1180px] px-5 py-7 md:px-8 md:py-9">
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
            <span className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Design preview
            </span>
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
              {VIEWS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setView(name)}
                  className={`rounded px-2.5 py-1 font-sans text-xs font-medium transition-colors ${
                    view === name
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowEmpty((value) => !value)}
              className="ml-auto rounded-md border border-border bg-card px-2.5 py-1 font-sans text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              {showEmpty ? 'Show populated state' : 'Show empty state'}
            </button>
          </div>

          {view === 'Dashboard' && <DashboardView {...data} LinkComponent={PreviewLink} />}

          {view === 'Ideas' && (
            <div className="space-y-7">
              <PageHeader
                eyebrow="Content"
                title="Blog ideas"
                description="Capture a working title and a brief, then generate drafts from it."
                actions={<Button>New idea</Button>}
              />
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <IdeaList
                    ideas={ideas}
                    loading={false}
                    onIdeaSelect={setSelectedIdea}
                    selectedIdea={selectedIdea}
                    onDelete={() => {}}
                    onCreateIdea={() => {}}
                  />
                </div>
              </div>
            </div>
          )}

          {view === 'Posts' && (
            <div className="space-y-7">
              <PageHeader
                eyebrow="Content"
                title="Posts"
                description="Review, refine and publish the drafts your model keys generated."
              />
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-3">
                  <PostCard
                    posts={posts}
                    loading={false}
                    onPostSelect={setSelectedPost}
                    selectedPost={selectedPost}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Reuse the root across HMR updates; a second createRoot on the same node warns.
const container = document.getElementById('root');
const root = (globalThis.__autoblogrPreviewRoot ??= createRoot(container));

root.render(
  <StrictMode>
    <ThemeProvider>
      <MemoryRouter>
        <PreviewApp />
      </MemoryRouter>
    </ThemeProvider>
  </StrictMode>,
);
