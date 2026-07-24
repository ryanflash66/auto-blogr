import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from 'autoblogr'
import { FileText, Globe, LayoutDashboard, Lightbulb, Settings } from 'lucide-react'

// `open` is set statically so the sheet paints inside the card — an
// interaction-driven open state would capture as a bare trigger button.
// modal is left at its default (true) on purpose: Radix's DialogOverlay
// returns null when modal={false}, and without the dim scrim the panel is
// bg-background on a white page — a white-on-white void where the `side`
// variant can't be read. Each cell captures alone, so the focus trap costs
// nothing. onOpenAutoFocus is prevented because Radix otherwise focuses the
// first field and selects its text, which captures as a blue selection
// highlight.

// side="right" — the default variant.
export const SiteSettingsSheet = () => (
  <Sheet open>
    <SheetContent side="right" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <SheetHeader>
        <SheetTitle>Site settings</SheetTitle>
        <SheetDescription>
          How AutoBlogr publishes to marketing-site.com.
        </SheetDescription>
      </SheetHeader>
      <div className="grid gap-5 py-6">
        <div className="grid gap-2">
          <Label htmlFor="sheet-site-url">WordPress URL</Label>
          <Input id="sheet-site-url" defaultValue="https://marketing-site.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sheet-category">Default category</Label>
          <Input id="sheet-category" defaultValue="Growth Marketing" />
        </div>
        <div className="flex items-center justify-between rounded-md border border-input p-3">
          <div className="pr-4">
            <p className="text-sm font-medium text-foreground">Publish automatically</p>
            <p className="text-sm text-muted-foreground">Skip the review queue.</p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
      <SheetFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Save changes</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

// side="left" — app navigation.
export const NavigationSheet = () => (
  <Sheet open>
    <SheetContent side="left" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <SheetHeader>
        <SheetTitle>AutoBlogr</SheetTitle>
        <SheetDescription>ry.balungeli@gmail.com</SheetDescription>
      </SheetHeader>
      <nav className="mt-6 flex flex-col gap-1">
        <span className="flex items-center gap-3 rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </span>
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4" />
          Content ideas
        </span>
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          Posts
        </span>
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          Connected sites
        </span>
        <span className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" />
          Settings
        </span>
      </nav>
    </SheetContent>
  </Sheet>
)

// side="bottom" — a wide utility panel.
export const PublishQueueSheet = () => (
  <Sheet open>
    <SheetContent side="bottom" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <SheetHeader>
        <SheetTitle>Publish queue</SheetTitle>
        <SheetDescription>3 posts scheduled for marketing-site.com this week.</SheetDescription>
      </SheetHeader>
      <div className="my-4 divide-y divide-border rounded-md border border-input">
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-medium text-foreground">
            10 SEO Mistakes Quietly Costing You Traffic
          </span>
          <span className="text-sm text-muted-foreground">Wed, 9:00 AM</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-medium text-foreground">
            How to Audit a Blog in 30 Minutes
          </span>
          <span className="text-sm text-muted-foreground">Thu, 9:00 AM</span>
        </div>
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-medium text-foreground">
            Internal Linking, Explained Simply
          </span>
          <span className="text-sm text-muted-foreground">Fri, 9:00 AM</span>
        </div>
      </div>
      <SheetFooter>
        <Button variant="outline">Pause queue</Button>
        <Button>Publish all now</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

// side="top" — an account-level banner panel.
export const CreditsSheet = () => (
  <Sheet open>
    <SheetContent side="top" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <SheetHeader>
        <SheetTitle>OpenRouter credits are running low</SheetTitle>
        <SheetDescription>
          $2.14 left on your key. Generation pauses at $0.00 — top up to keep the Friday post on
          schedule.
        </SheetDescription>
      </SheetHeader>
      <SheetFooter className="mt-6">
        <Button variant="outline">Remind me later</Button>
        <Button>Add credits</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
