import {
  Badge,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from 'autoblogr'

// Canonical usage: uncontrolled via defaultValue, one TabsContent per trigger
// value. The active trigger is styled by data-[state=active].
export const PostEditorTabs = () => (
  <Tabs defaultValue="seo" className="w-96">
    <TabsList>
      <TabsTrigger value="content">Content</TabsTrigger>
      <TabsTrigger value="seo">SEO</TabsTrigger>
      <TabsTrigger value="publish">Publish</TabsTrigger>
    </TabsList>
    <TabsContent value="content" className="grid gap-2">
      <Label htmlFor="post-body">Draft body</Label>
      <Textarea id="post-body" rows={3} defaultValue="Scheduling posts by hand doesn't scale past a few sites." />
    </TabsContent>
    <TabsContent value="seo" className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="focus-keyword">Focus keyword</Label>
        <Input id="focus-keyword" defaultValue="content calendar automation" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="meta-description">Meta description</Label>
        <Textarea
          id="meta-description"
          rows={2}
          defaultValue="Automate your editorial calendar and publish to WordPress on a schedule."
        />
        <p className="text-sm text-muted-foreground">88 / 160 characters</p>
      </div>
    </TabsContent>
    <TabsContent value="publish" className="grid gap-2">
      <p className="text-sm text-muted-foreground">Publishes to gardenjournal.blog at 09:00 UTC.</p>
      <Button size="sm" className="w-max">Schedule post</Button>
    </TabsContent>
  </Tabs>
)

// TabsTrigger forwards `disabled` to the underlying button — the trigger dims
// and stops responding, but the tab stays in the list for context.
export const WithDisabledTab = () => (
  <Tabs defaultValue="drafts" className="w-96">
    <TabsList>
      <TabsTrigger value="drafts">Drafts</TabsTrigger>
      <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
      <TabsTrigger value="analytics" disabled>
        Analytics
      </TabsTrigger>
    </TabsList>
    <TabsContent value="drafts" className="grid gap-2">
      <div className="flex items-center justify-between rounded-md border border-input p-3">
        <span className="text-sm text-foreground">Automating Your Content Calendar</span>
        <Badge variant="secondary">Draft</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Analytics unlocks once a post has been live for 24 hours.
      </p>
    </TabsContent>
    <TabsContent value="scheduled">
      <p className="text-sm text-muted-foreground">3 posts queued for next week.</p>
    </TabsContent>
    <TabsContent value="analytics">
      <p className="text-sm text-muted-foreground">No traffic data yet.</p>
    </TabsContent>
  </Tabs>
)

// TabsList is inline-flex by default; make it a full-width grid to get an
// evenly divided segmented control.
export const FullWidthSegmented = () => (
  <Tabs defaultValue="all" className="w-80">
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value="all">All</TabsTrigger>
      <TabsTrigger value="mine">Mine</TabsTrigger>
      <TabsTrigger value="archived">Archived</TabsTrigger>
    </TabsList>
    <TabsContent value="all">
      <p className="text-sm text-muted-foreground">78 ideas across 4 WordPress sites.</p>
    </TabsContent>
    <TabsContent value="mine">
      <p className="text-sm text-muted-foreground">12 ideas you generated this week.</p>
    </TabsContent>
    <TabsContent value="archived">
      <p className="text-sm text-muted-foreground">Nothing archived yet.</p>
    </TabsContent>
  </Tabs>
)
