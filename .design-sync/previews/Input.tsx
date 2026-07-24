import { Input, Label } from 'autoblogr'

export const Basic = () => (
  <div className="flex max-w-md flex-col gap-2">
    <Label htmlFor="post-title">Post title</Label>
    <Input id="post-title" placeholder="How to automate your content calendar" />
  </div>
)

export const Types = () => (
  <div className="grid max-w-2xl grid-cols-2 gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-text">Post title</Label>
      <Input id="type-text" type="text" defaultValue="10 WordPress SEO Fixes in 5 Minutes" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-email">Notification email</Label>
      <Input id="type-email" type="email" placeholder="you@yourdomain.com" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-password">OpenRouter API key</Label>
      <Input id="type-password" type="password" defaultValue="sk-or-v1-3f9ac2" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-number">Posts per week</Label>
      <Input id="type-number" type="number" defaultValue={3} min={1} max={14} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-url">WordPress site URL</Label>
      <Input id="type-url" type="url" defaultValue="https://blog.acmeroasters.com" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="type-search">Search ideas</Label>
      <Input id="type-search" type="search" placeholder="Search content ideas…" />
    </div>
  </div>
)

export const States = () => (
  <div className="grid max-w-md gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="state-empty">Empty</Label>
      <Input id="state-empty" placeholder="Add a content idea…" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="state-value">With value</Label>
      <Input id="state-value" defaultValue="Cold Brew vs. Iced Coffee: A Buyer's Guide" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="state-disabled">Disabled</Label>
      <Input id="state-disabled" disabled defaultValue="Connect a site to enable" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="state-readonly">Read only</Label>
      <Input id="state-readonly" readOnly defaultValue="wp_autoblogr_7f2c9d" />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="state-error" className="text-destructive">
        Invalid
      </Label>
      <Input
        id="state-error"
        aria-invalid
        defaultValue="blog.acmeroasters"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">Enter a full URL, including https://</p>
    </div>
  </div>
)

export const FileUpload = () => (
  <div className="flex max-w-md flex-col gap-2">
    <Label htmlFor="featured-image">Featured image</Label>
    <Input id="featured-image" type="file" accept="image/png,image/jpeg" />
    <p className="text-sm text-muted-foreground">
      PNG or JPG up to 4 MB. Leave empty to generate one at publish time.
    </p>
  </div>
)
