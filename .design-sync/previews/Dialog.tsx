import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from 'autoblogr'

// `open` is set statically so the dialog paints inside the card — an
// interaction-driven open state would capture as an empty trigger button.
// modal is left at its default (true) on purpose: Radix's DialogOverlay returns
// null when modal={false}, and the bg-black/80 scrim is how a Dialog actually
// looks in the app. onOpenAutoFocus is prevented because Radix otherwise focuses
// the first field and selects its text, which captures as a blue selection
// highlight.
export const PublishDialog = () => (
  <Dialog open>
    <DialogContent className="max-w-md" onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Publish to WordPress</DialogTitle>
        <DialogDescription>
          This post will go live on marketing-site.com immediately.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" defaultValue="ten-seo-mistakes-to-avoid" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Input id="excerpt" defaultValue="The errors quietly costing you traffic." />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancel</Button>
        <Button>Publish now</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
