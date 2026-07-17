import { Separator } from 'autoblogr'

export const Horizontal = () => (
  <div className="w-full max-w-sm">
    <div className="space-y-1">
      <h4 className="text-sm font-medium leading-none">AutoBlogr</h4>
      <p className="text-sm text-muted-foreground">Automated blog publishing for WordPress.</p>
    </div>
    <Separator className="my-4" />
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>Posts</div>
      <Separator orientation="vertical" />
      <div>Ideas</div>
      <Separator orientation="vertical" />
      <div>Sites</div>
    </div>
  </div>
)

export const Vertical = () => (
  <div className="flex h-16 w-fit items-center gap-4 rounded-lg border px-4">
    <div className="text-center">
      <p className="text-lg font-semibold">248</p>
      <p className="text-xs text-muted-foreground">Posts</p>
    </div>
    <Separator orientation="vertical" />
    <div className="text-center">
      <p className="text-lg font-semibold">12</p>
      <p className="text-xs text-muted-foreground">Sites</p>
    </div>
    <Separator orientation="vertical" />
    <div className="text-center">
      <p className="text-lg font-semibold">81</p>
      <p className="text-xs text-muted-foreground">Avg SEO</p>
    </div>
  </div>
)

export const InContext = () => (
  <div className="w-full max-w-sm rounded-lg border">
    <div className="p-4">
      <p className="text-sm font-medium">Publishing queue</p>
      <p className="text-xs text-muted-foreground">marketing-site.com</p>
    </div>
    <Separator />
    <div className="space-y-3 p-4 text-sm">
      <div className="flex items-center justify-between">
        <span>Ten SEO mistakes to avoid</span>
        <span className="text-muted-foreground">09:00</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span>Crawl budget 101</span>
        <span className="text-muted-foreground">14:00</span>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span>Editorial calendar teardown</span>
        <span className="text-muted-foreground">Thu 09:00</span>
      </div>
    </div>
  </div>
)
