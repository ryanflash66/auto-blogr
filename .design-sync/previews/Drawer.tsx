import {
  Badge,
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
} from 'autoblogr'

// `open` is set statically so the drawer paints inside the card — an
// interaction-driven open state would capture as a bare trigger button.
// modal is left at its default (true) so vaul renders the dim scrim: without
// it the panel is bg-background on a white page and reads as a white-on-white
// void. shouldScaleBackground={false} stops vaul from scaling a page that has
// no [vaul-drawer-wrapper] app shell to scale.
// onOpenAutoFocus is prevented because vaul otherwise focuses the first field
// and selects its text, which captures as a blue selection highlight.

export const SchedulePostDrawer = () => (
  <Drawer open shouldScaleBackground={false}>
    <DrawerContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <div className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>Schedule post</DrawerTitle>
          <DrawerDescription>
            “10 SEO Mistakes Quietly Costing You Traffic” → marketing-site.com
          </DrawerDescription>
        </DrawerHeader>
        <div className="grid gap-4 px-4">
          <div className="grid gap-2">
            <Label htmlFor="drawer-date">Publish date</Label>
            <Input id="drawer-date" defaultValue="Wed, June 5 · 9:00 AM" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="drawer-category">Category</Label>
            <Input id="drawer-category" defaultValue="Growth Marketing" />
          </div>
        </div>
        <DrawerFooter>
          <Button>Schedule post</Button>
          <Button variant="outline">Save as draft</Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
)

export const IdeaDetailDrawer = () => (
  <Drawer open shouldScaleBackground={false}>
    <DrawerContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <div className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>Content idea</DrawerTitle>
          <DrawerDescription>
            Generated from your “Growth Marketing” keyword set.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <p className="text-sm font-medium text-foreground">
            How to Audit a Blog in 30 Minutes
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            A checklist post targeting “blog audit” — low competition, steady search volume.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">blog audit</Badge>
            <Badge variant="secondary">1.2k searches/mo</Badge>
            <Badge variant="outline">SEO score 82</Badge>
          </div>
        </div>
        <DrawerFooter>
          <Button>Generate draft</Button>
          <Button variant="outline">Dismiss idea</Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
)
