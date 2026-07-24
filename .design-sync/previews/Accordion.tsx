import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from 'autoblogr'

export const Single = () => (
  <Accordion type="single" collapsible defaultValue="scheduling" className="w-full max-w-xl">
    <AccordionItem value="scheduling">
      <AccordionTrigger>How does AutoBlogr schedule posts?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Each connected WordPress site has its own publishing cadence. Approved drafts are queued and
        pushed to the site at the next open slot — typically Tuesday and Thursday at 09:00 local time.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="keys">
      <AccordionTrigger>Where are my OpenRouter keys stored?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Your key is encrypted at rest and only ever sent to the model provider you selected.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="seo">
      <AccordionTrigger>What goes into the SEO score?</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Title length, keyword coverage, heading structure, internal links and readability.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

export const Multiple = () => (
  <Accordion
    type="multiple"
    defaultValue={['draft', 'images']}
    className="w-full max-w-xl"
  >
    <AccordionItem value="draft">
      <AccordionTrigger>Draft generation</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Model: Claude Sonnet · 1,200–1,600 words · outline-first
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="images">
      <AccordionTrigger>Featured images</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        One hero image per post, generated after the draft is approved.
      </AccordionContent>
    </AccordionItem>
    <AccordionItem value="publishing">
      <AccordionTrigger>Publishing</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        Posts are pushed to WordPress as drafts unless auto-publish is enabled.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

export const InContext = () => (
  <div className="w-full max-w-xl rounded-lg border p-4">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-sm font-medium">Pipeline runs</p>
      <Badge variant="secondary">3 today</Badge>
    </div>
    <Accordion type="single" collapsible defaultValue="run-1">
      <AccordionItem value="run-1">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            marketing-site.com
            <Badge>Published</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-1 text-muted-foreground">
          <p>Ten SEO mistakes to avoid — 1,240 words</p>
          <p>Generated 09:31 · published 09:34 · SEO 87</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="run-2">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            blog.acme-docs.dev
            <Badge variant="destructive">Failed</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          WordPress returned 401 — application password expired.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
)
