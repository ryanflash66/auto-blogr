import { ArrowRight, FileText, Globe, Lightbulb, Plus, Sparkles } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { StatTile } from '@/components/ui/stat-tile';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PIPELINE_ORDER = ['draft', 'generating', 'ready', 'scheduled', 'published'];
const PIPELINE_BAR = {
  draft: 'bg-status-draft',
  generating: 'bg-status-generating',
  ready: 'bg-status-ready',
  scheduled: 'bg-status-scheduled',
  published: 'bg-status-published',
};

function Panel({ title, icon: Icon, action, children, className }) {
  return (
    <section className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="flex items-center gap-2 font-sans text-sm font-semibold tracking-normal text-foreground">
          {Icon ? <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActivityRow({ title, meta, status, timestamp }) {
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/60">
      <div className="min-w-0 space-y-1">
        <p className="truncate font-sans text-sm font-medium text-foreground">{title}</p>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <StatusBadge status={status} />
        <span className="nums text-[0.6875rem] text-muted-foreground">{timestamp}</span>
      </div>
    </li>
  );
}

/**
 * Presentational dashboard. It takes already-shaped data so it can render from
 * the live Supabase queries or from the local design-preview harness.
 */
export function DashboardView({
  businessName,
  stats,
  pipeline = {},
  recentIdeas = [],
  recentPosts = [],
  LinkComponent = 'a',
  ideasUrl = '/ideas',
  postsUrl = '/posts',
  sitesUrl = '/wordpress',
}) {
  const pipelineTotal = PIPELINE_ORDER.reduce((sum, key) => sum + (pipeline[key] ?? 0), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Overview"
        title={businessName ? `Welcome back, ${businessName}` : 'Welcome back'}
        description="What is in the pipeline, and what moved since you were last here."
        actions={
          <Button asChild>
            <LinkComponent to={ideasUrl} href={ideasUrl}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              New idea
            </LinkComponent>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Ideas"
          value={stats.totalIdeas}
          hint="Captured and ready to draft"
          icon={Lightbulb}
        />
        <StatTile
          label="Posts"
          value={stats.totalPosts}
          hint="Drafted with your own model keys"
          icon={FileText}
        />
        <StatTile
          label="Published"
          value={stats.publishedPosts}
          hint="Live on a connected site"
          icon={Sparkles}
          emphasis
        />
        <StatTile
          label="Sites"
          value={stats.connectedSites}
          hint="WordPress connections"
          icon={Globe}
        />
      </div>

      <Panel
        title="Content pipeline"
        action={
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
            <LinkComponent to={postsUrl} href={postsUrl}>
              All posts
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </LinkComponent>
          </Button>
        }
      >
        <div className="space-y-4 px-5 py-5">
          {pipelineTotal > 0 ? (
            <>
              <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={`${pipelineTotal} posts across the pipeline`}
              >
                {PIPELINE_ORDER.map((key) => {
                  const count = pipeline[key] ?? 0;
                  if (count === 0) return null;
                  return (
                    <span
                      key={key}
                      className={cn(PIPELINE_BAR[key])}
                      style={{ width: `${(count / pipelineTotal) * 100}%` }}
                    />
                  );
                })}
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5">
                {PIPELINE_ORDER.map((key) => (
                  <div key={key} className="space-y-1">
                    <dt className="flex items-center gap-1.5 font-sans text-xs capitalize text-muted-foreground">
                      <span
                        aria-hidden="true"
                        className={cn('h-2 w-2 rounded-full', PIPELINE_BAR[key])}
                      />
                      {key}
                    </dt>
                    <dd className="nums font-serif text-lg font-semibold leading-none text-foreground">
                      {pipeline[key] ?? 0}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nothing in the pipeline yet"
              description="Capture an idea and generate the first draft to see it tracked here."
              action={
                <Button asChild variant="outline" size="sm">
                  <LinkComponent to={ideasUrl} href={ideasUrl}>
                    Capture an idea
                  </LinkComponent>
                </Button>
              }
              className="border-0 py-6"
            />
          )}
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Recent ideas"
          icon={Lightbulb}
          action={
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <LinkComponent to={ideasUrl} href={ideasUrl}>
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkComponent>
            </Button>
          }
        >
          {recentIdeas.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentIdeas.map((idea) => (
                <ActivityRow
                  key={idea.id}
                  title={idea.title}
                  meta={idea.description}
                  status={idea.status}
                  timestamp={idea.timestamp}
                />
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={Lightbulb}
                title="No ideas yet"
                description="Ideas are the input to every draft. Start with a working title."
                action={
                  <Button asChild variant="outline" size="sm">
                    <LinkComponent to={ideasUrl} href={ideasUrl}>
                      Create your first idea
                    </LinkComponent>
                  </Button>
                }
                className="border-0"
              />
            </div>
          )}
        </Panel>

        <Panel
          title="Recent posts"
          icon={FileText}
          action={
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <LinkComponent to={postsUrl} href={postsUrl}>
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </LinkComponent>
            </Button>
          }
        >
          {recentPosts.length > 0 ? (
            <ul className="divide-y divide-border">
              {recentPosts.map((post) => (
                <ActivityRow
                  key={post.id}
                  title={post.title}
                  meta={post.meta}
                  status={post.status}
                  timestamp={post.timestamp}
                />
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={FileText}
                title="No drafts yet"
                description="Generate a draft from an idea, then review it before publishing."
                action={
                  <Button asChild variant="outline" size="sm">
                    <LinkComponent to={sitesUrl} href={sitesUrl}>
                      Connect a site
                    </LinkComponent>
                  </Button>
                }
                className="border-0"
              />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
