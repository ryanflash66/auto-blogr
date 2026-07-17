import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'autoblogr'
import { CircleDot } from 'lucide-react'

// `open` is set statically so the alert paints inside the card — an
// interaction-driven open state would capture as a bare trigger button.
// onOpenAutoFocus is prevented because Radix otherwise focuses the Cancel
// button, which captures as a stray focus ring.

export const DeleteDraftAlert = () => (
  <AlertDialog open>
    <AlertDialogContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
        <AlertDialogDescription>
          “10 SEO Mistakes Quietly Costing You Traffic” and its generated header image will be
          permanently removed. This can’t be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep draft</AlertDialogCancel>
        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Delete draft
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const DisconnectSiteAlert = () => (
  <AlertDialog open>
    <AlertDialogContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <AlertDialogHeader>
        <AlertDialogTitle>Disconnect marketing-site.com?</AlertDialogTitle>
        <AlertDialogDescription>
          AutoBlogr will stop publishing to this WordPress site. Posts already live stay published.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="rounded-md border border-input bg-muted p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">This also cancels:</p>
        <div className="mt-2 space-y-1.5">
          <div className="flex items-start gap-2">
            <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>4 posts scheduled through Jun 12</span>
          </div>
          <div className="flex items-start gap-2">
            <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>The weekly “Growth Notes” content plan</span>
          </div>
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Disconnect site
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export const RotateApiKeyAlert = () => (
  <AlertDialog open>
    <AlertDialogContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
      <AlertDialogHeader>
        <AlertDialogTitle>Replace your OpenRouter key?</AlertDialogTitle>
        <AlertDialogDescription>
          The key ending in ••••4f2a will be overwritten. Any generation running right now will
          finish on the old key.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Not now</AlertDialogCancel>
        <AlertDialogAction>Replace key</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
