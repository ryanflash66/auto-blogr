import { Checkbox, Label } from 'autoblogr'

export const Basic = () => (
  <div className="flex items-center gap-2">
    <Checkbox id="cb-basic" defaultChecked />
    <Label htmlFor="cb-basic">Generate a featured image</Label>
  </div>
)

export const States = () => (
  <div className="grid gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="cb-unchecked" />
      <Label htmlFor="cb-unchecked">Unchecked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-checked" defaultChecked />
      <Label htmlFor="cb-checked">Checked</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-disabled" disabled />
      <Label htmlFor="cb-disabled">Disabled</Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="cb-disabled-checked" disabled defaultChecked />
      <Label htmlFor="cb-disabled-checked">Disabled and checked</Label>
    </div>
  </div>
)

export const PublishTargets = () => (
  <div className="flex max-w-md flex-col gap-3">
    <Label>Publish to</Label>
    <div className="flex items-center gap-2">
      <Checkbox id="site-roasters" defaultChecked />
      <Label htmlFor="site-roasters" className="font-normal">
        blog.acmeroasters.com
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="site-fieldnotes" defaultChecked />
      <Label htmlFor="site-fieldnotes" className="font-normal">
        fieldnotes.acmeroasters.com
      </Label>
    </div>
    <div className="flex items-center gap-2">
      <Checkbox id="site-legacy" disabled />
      <Label htmlFor="site-legacy" className="font-normal">
        legacy.acmeroasters.com
      </Label>
      <span className="text-sm text-muted-foreground">— token expired</span>
    </div>
  </div>
)

export const WithDescription = () => (
  <div className="flex max-w-md items-start gap-3 rounded-md border border-input p-4">
    <Checkbox id="cb-desc" defaultChecked className="mt-0.5" />
    <div className="grid gap-1.5">
      <Label htmlFor="cb-desc">Require review before publishing</Label>
      <p className="text-sm text-muted-foreground">
        Drafts land in your queue instead of going live. Recommended while you tune the tone
        prompt.
      </p>
    </div>
  </div>
)
