import { Checkbox, Input, Label, RadioGroup, RadioGroupItem, Switch } from 'autoblogr'

export const Basic = () => (
  <div className="flex max-w-md flex-col gap-2">
    <Label htmlFor="label-basic">Post title</Label>
    <Input id="label-basic" placeholder="How to automate your content calendar" />
  </div>
)

export const RequiredField = () => (
  <div className="flex max-w-md flex-col gap-2">
    <Label htmlFor="label-required">
      WordPress site URL <span className="text-destructive">*</span>
    </Label>
    <Input id="label-required" required type="url" placeholder="https://blog.acmeroasters.com" />
    <p className="text-sm text-muted-foreground">
      The REST endpoint AutoBlogr publishes drafts to.
    </p>
  </div>
)

export const WithControls = () => (
  <div className="grid max-w-md gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="label-cb" defaultChecked />
      <Label htmlFor="label-cb">Generate a featured image</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="label-sw" defaultChecked />
      <Label htmlFor="label-sw">Publish automatically once approved</Label>
    </div>
    <RadioGroup defaultValue="draft">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="draft" id="label-r1" />
        <Label htmlFor="label-r1">Save as draft</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="publish" id="label-r2" />
        <Label htmlFor="label-r2">Publish immediately</Label>
      </div>
    </RadioGroup>
  </div>
)

export const DisabledControl = () => (
  <div className="grid max-w-md gap-4">
    <div className="flex items-center gap-2">
      <Checkbox id="label-dis" disabled />
      <Label htmlFor="label-dis">Cross-post to Medium</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="label-dis-sw" disabled defaultChecked />
      <Label htmlFor="label-dis-sw">Auto-generate internal links</Label>
    </div>
    <p className="text-sm text-muted-foreground">
      Label dims with its control — <code className="font-mono">peer-disabled</code> keys off the
      sibling input.
    </p>
  </div>
)
