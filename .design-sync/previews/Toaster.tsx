import { Toaster, ToastAction, toast } from 'autoblogr'

// Toaster takes no props — it renders whatever the module-level useToast()
// queue holds, and that queue is empty in a static render, so mounting it
// alone paints nothing. Instead of faking a lookalike, this cell seeds the
// REAL queue by calling the exported toast() (the exact call app code makes)
// at module scope, before React mounts. The queue is already populated when
// useToast() reads it on first render, so what you see below is a genuine
// <Toaster/> rendering live entries — Toast/ToastProvider/ToastViewport are
// all Toaster's own output, not a stand-in.
//
// duration: Infinity is the one capture concession: Radix would otherwise
// auto-dismiss both toasts 5s in, mid-capture. Real app calls omit it.
// The queue is global and capped at 3 (TOAST_LIMIT), and Toaster is meant to
// be mounted exactly once near the app root — which is why this file has a
// single cell rather than several competing for one shared queue.
toast({
  variant: 'destructive',
  title: 'Publishing failed',
  description: 'WordPress rejected “A friendlier tone for technical posts”.',
  duration: Infinity,
  action: <ToastAction altText="Retry publishing this post">Retry</ToastAction>,
})

toast({
  title: 'Post published',
  description: '“Ten SEO mistakes to avoid” is live on marketing-site.com.',
  duration: Infinity,
})

export const MountedWithQueue = () => (
  <>
    <div className="h-64 rounded-lg border bg-muted/40 p-6">
      <p className="text-sm font-medium">Content queue</p>
      <p className="mt-1 text-xs text-muted-foreground">
        4 drafts scheduled for marketing-site.com this week
      </p>
    </div>
    {/* In the app this sits once at the root of the tree, beside <App/>. */}
    <Toaster />
  </>
)
