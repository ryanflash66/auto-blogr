import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'autoblogr'
import { ChevronsUpDown } from 'lucide-react'

export const Open = () => (
  <Collapsible defaultOpen className="w-full max-w-md space-y-2">
    <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-2">
      <p className="text-sm font-medium">Advanced generation settings</p>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 p-0">
          <ChevronsUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border px-4 py-2 font-mono text-sm">temperature: 0.7</div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">target_words: 1400</div>
      <div className="rounded-md border px-4 py-2 font-mono text-sm">tone: conversational</div>
    </CollapsibleContent>
  </Collapsible>
)

export const Closed = () => (
  <Collapsible className="w-full max-w-md space-y-2">
    <div className="flex items-center justify-between gap-4 rounded-md border px-4 py-2">
      <p className="text-sm font-medium">Advanced generation settings</p>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 p-0">
          <ChevronsUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border px-4 py-2 font-mono text-sm">temperature: 0.7</div>
    </CollapsibleContent>
  </Collapsible>
)

export const InContext = () => (
  <Collapsible defaultOpen className="w-full max-w-md rounded-lg border p-4">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">Ten SEO mistakes to avoid</p>
        <p className="text-xs text-muted-foreground">marketing-site.com · 1,240 words</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge>Published</Badge>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle details</span>
          </Button>
        </CollapsibleTrigger>
      </div>
    </div>
    <CollapsibleContent className="mt-3 space-y-1 text-sm text-muted-foreground">
      <p>SEO score 87 · readability grade 8</p>
      <p>Keywords: technical SEO, crawl budget, canonical tags</p>
      <p>Published 16 Jul 2026 at 09:34</p>
    </CollapsibleContent>
  </Collapsible>
)
