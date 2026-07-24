import { Badge } from 'autoblogr'
import { CircleCheck, CircleX, Clock, Sparkles } from 'lucide-react'

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>Published</Badge>
    <Badge variant="secondary">Draft</Badge>
    <Badge variant="destructive">Failed</Badge>
    <Badge variant="outline">Scheduled</Badge>
  </div>
)

export const WithIcon = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>
      <CircleCheck className="mr-1 h-3 w-3" />
      Published
    </Badge>
    <Badge variant="secondary">
      <Clock className="mr-1 h-3 w-3" />
      Scheduled
    </Badge>
    <Badge variant="destructive">
      <CircleX className="mr-1 h-3 w-3" />
      Publish failed
    </Badge>
    <Badge variant="outline">
      <Sparkles className="mr-1 h-3 w-3" />
      AI draft
    </Badge>
  </div>
)

export const Topics = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="secondary">SEO</Badge>
    <Badge variant="secondary">Content strategy</Badge>
    <Badge variant="secondary">WordPress</Badge>
    <Badge variant="secondary">Analytics</Badge>
    <Badge variant="outline">+4</Badge>
  </div>
)

export const InContext = () => (
  <div className="max-w-xl space-y-3">
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">Ten SEO mistakes to avoid</p>
        <p className="text-xs text-muted-foreground">marketing-site.com · 1,240 words</p>
      </div>
      <Badge>Published</Badge>
    </div>
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">How we automated our editorial calendar</p>
        <p className="text-xs text-muted-foreground">marketing-site.com · 980 words</p>
      </div>
      <Badge variant="secondary">Draft</Badge>
    </div>
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">A friendlier tone for technical posts</p>
        <p className="text-xs text-muted-foreground">blog.acme-docs.dev · 1,610 words</p>
      </div>
      <Badge variant="destructive">Failed</Badge>
    </div>
  </div>
)
