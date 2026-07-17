import { Badge, ScrollArea, ScrollBar, Separator } from 'autoblogr'

const ideas = [
  'Ten SEO mistakes to avoid in 2026',
  'Crawl budget 101 for large blogs',
  'How we automated our editorial calendar',
  'A friendlier tone for technical posts',
  'Internal linking without the busywork',
  'Do AI drafts still need a human editor?',
  'Schema markup that actually moves rankings',
  'Repurposing changelogs into blog posts',
  'Measuring content ROI with GA4',
  'When to refresh an old post instead of writing new',
  'Building a topic cluster from one keyword',
  'WordPress application passwords, explained',
]

export const Vertical = () => (
  <ScrollArea type="always" className="h-64 w-72 rounded-md border">
    <div className="p-4">
      <h4 className="mb-3 text-sm font-medium leading-none">Idea backlog</h4>
      {ideas.map((idea) => (
        <div key={idea}>
          <div className="py-2 text-sm">{idea}</div>
          <Separator />
        </div>
      ))}
    </div>
  </ScrollArea>
)

export const Horizontal = () => (
  <ScrollArea type="always" className="w-80 whitespace-nowrap rounded-md border">
    <div className="flex w-max space-x-4 p-4">
      {['marketing-site.com', 'blog.acme-docs.dev', 'shop.northwind.io', 'careers.acme.dev'].map(
        (site) => (
          <div key={site} className="w-48 shrink-0 rounded-md border p-3">
            <p className="truncate text-sm font-medium">{site}</p>
            <p className="mt-1 text-xs text-muted-foreground">24 posts · avg SEO 81</p>
            <Badge variant="secondary" className="mt-2">
              Connected
            </Badge>
          </div>
        )
      )}
    </div>
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
)

export const InContext = () => (
  <div className="w-80 rounded-lg border">
    <div className="p-4">
      <p className="text-sm font-medium">Run log</p>
      <p className="text-xs text-muted-foreground">Nightly generation · 16 Jul 2026</p>
    </div>
    <Separator />
    <ScrollArea type="always" className="h-56">
      <div className="space-y-2 p-4 font-mono text-xs">
        {[
          '09:30:02 selecting ideas (12 queued)',
          '09:30:04 model=claude-sonnet temp=0.7',
          '09:30:11 outline ok — 6 sections',
          '09:31:40 draft ok — 1,240 words',
          '09:31:41 seo score 87',
          '09:31:55 hero image generated',
          '09:32:03 pushing to marketing-site.com',
          '09:32:06 published id=4821',
          '09:32:07 next: blog.acme-docs.dev',
          '09:33:12 draft ok — 1,610 words',
          '09:33:20 wordpress 401 — auth failed',
          '09:33:20 run finished with 1 error',
        ].map((line) => (
          <p key={line} className="text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </ScrollArea>
  </div>
)
