import { Label, Switch } from 'autoblogr'

export const Basic = () => (
  <div className="flex items-center gap-2">
    <Switch id="sw-basic" defaultChecked />
    <Label htmlFor="sw-basic">Publish automatically once approved</Label>
  </div>
)

export const States = () => (
  <div className="grid gap-4">
    <div className="flex items-center gap-2">
      <Switch id="sw-off" />
      <Label htmlFor="sw-off">Off</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-on" defaultChecked />
      <Label htmlFor="sw-on">On</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-off-disabled" disabled />
      <Label htmlFor="sw-off-disabled">Off and disabled</Label>
    </div>
    <div className="flex items-center gap-2">
      <Switch id="sw-on-disabled" disabled defaultChecked />
      <Label htmlFor="sw-on-disabled">On and disabled</Label>
    </div>
  </div>
)

export const SettingsList = () => (
  <div className="flex max-w-md flex-col rounded-md border border-input">
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="grid gap-1">
        <Label htmlFor="set-schedule">Scheduled publishing</Label>
        <p className="text-sm text-muted-foreground">Push approved drafts live every weekday at 09:00.</p>
      </div>
      <Switch id="set-schedule" defaultChecked />
    </div>
    <div className="flex items-center justify-between gap-4 border-t border-border p-4">
      <div className="grid gap-1">
        <Label htmlFor="set-images">Generate featured images</Label>
        <p className="text-sm text-muted-foreground">Uses your image provider key. Billed per image.</p>
      </div>
      <Switch id="set-images" defaultChecked />
    </div>
    <div className="flex items-center justify-between gap-4 border-t border-border p-4">
      <div className="grid gap-1">
        <Label htmlFor="set-seo">SEO meta suggestions</Label>
        <p className="text-sm text-muted-foreground">Draft a title tag and meta description per post.</p>
      </div>
      <Switch id="set-seo" />
    </div>
    <div className="flex items-center justify-between gap-4 border-t border-border p-4">
      <div className="grid gap-1">
        <Label htmlFor="set-crosspost">Cross-post to Medium</Label>
        <p className="text-sm text-muted-foreground">Connect a Medium account to enable.</p>
      </div>
      <Switch id="set-crosspost" disabled />
    </div>
  </div>
)
