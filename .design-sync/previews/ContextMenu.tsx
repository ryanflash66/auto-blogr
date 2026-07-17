import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from 'autoblogr'

// Radix's ContextMenu root holds its open state internally (`React.useState`)
// and exposes no `open` prop — the anchor point comes from the contextmenu
// event itself. So the only way to paint an open context menu statically is to
// dispatch one real `contextmenu` event at the trigger on mount, with the
// pointer coordinates we want the menu anchored to. This runs once per page
// load; there is no interactive state.
const openMenuAt = (dx: number, dy: number) => (el: HTMLElement | null) => {
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + dx,
      clientY: rect.top + dy,
    })
  )
}

export const PostCardContextMenu = () => (
  <div className="p-4">
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={openMenuAt(236, 112)}
          className="flex h-32 w-64 flex-col justify-between rounded-md border border-input bg-card p-4 text-sm shadow-sm"
        >
          <span className="font-medium text-foreground">10 SEO Mistakes to Avoid</span>
          <span className="text-xs text-muted-foreground">
            Draft · marketing-site.com · right-click for actions
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-60"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <ContextMenuLabel inset>10 SEO Mistakes to Avoid</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          Open in editor
          <ContextMenuShortcut>⌘O</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Duplicate draft
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          View published post
        </ContextMenuItem>
        <ContextMenuSub open>
          <ContextMenuSubTrigger inset>Move to site</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>marketing-site.com</ContextMenuItem>
            <ContextMenuItem>devblog.acme.io</ContextMenuItem>
            <ContextMenuItem>docs.acme.io</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem inset className="text-destructive focus:text-destructive">
          Delete draft
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
)

export const IdeaBoardContextMenu = () => (
  <div className="p-4">
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={openMenuAt(236, 112)}
          className="flex h-32 w-64 flex-col justify-between rounded-md border border-input bg-card p-4 text-sm shadow-sm"
        >
          <span className="font-medium text-foreground">Content idea queue</span>
          <span className="text-xs text-muted-foreground">
            14 ideas · right-click to configure
          </span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent
        className="w-56"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <ContextMenuLabel>Board options</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Show SEO score</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked>Show target keyword</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={false}>Show token cost</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Group ideas by</ContextMenuLabel>
        <ContextMenuRadioGroup value="site">
          <ContextMenuRadioItem value="site">WordPress site</ContextMenuRadioItem>
          <ContextMenuRadioItem value="tone">Tone of voice</ContextMenuRadioItem>
          <ContextMenuRadioItem value="status">Status</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  </div>
)
