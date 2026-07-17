import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from 'autoblogr'
import { CalendarClock, Settings2 } from 'lucide-react'

// `open` is set statically so the popover paints inside the card — an
// interaction-driven open state would capture as a bare trigger button.
// onOpenAutoFocus is prevented because Radix otherwise focuses the first field
// and selects its text, which captures as a blue selection highlight.

export const SeoSettingsPopover = () => (
  <div className="p-2">
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings2 className="mr-2 h-4 w-4" />
          SEO settings
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none text-foreground">SEO settings</h4>
            <p className="text-sm text-muted-foreground">Applied to every generated draft.</p>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="pop-keyword">Keyword</Label>
              <Input id="pop-keyword" defaultValue="blog audit" className="col-span-2 h-8" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="pop-words">Word count</Label>
              <Input id="pop-words" defaultValue="1,400" className="col-span-2 h-8" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="pop-meta">Auto meta description</Label>
              <Switch id="pop-meta" defaultChecked />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)

export const SchedulePopover = () => (
  <div className="p-2">
    <Popover open>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarClock className="mr-2 h-4 w-4" />
          Wed, 9:00 AM
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <div className="grid gap-3">
          <div className="space-y-1">
            <h4 className="font-medium leading-none text-foreground">Publishing cadence</h4>
            <p className="text-sm text-muted-foreground">marketing-site.com</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pop-cadence">Frequency</Label>
            <Input id="pop-cadence" defaultValue="Weekly on Wednesday" className="h-8" />
          </div>
          <Button size="sm">Update schedule</Button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
)
