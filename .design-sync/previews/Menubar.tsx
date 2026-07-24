import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from 'autoblogr'

// The bar renders inline, but the menu content is portalled: `value` on the
// Menubar root is set statically so one menu paints open inside the card —
// an interaction-driven open state would capture as a bare bar.
// onOpenAutoFocus is prevented because Radix otherwise focuses the first item
// and the focus ring captures as an artifact.

export const EditorMenubar = () => (
  <div className="p-2">
    <Menubar value="post" className="w-fit">
      <MenubarMenu value="post">
        <MenubarTrigger>Post</MenubarTrigger>
        <MenubarContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
          <MenubarItem>
            New draft
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Save draft
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSub open>
            <MenubarSubTrigger>Export as</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Markdown</MenubarItem>
              <MenubarItem>HTML</MenubarItem>
              <MenubarItem>WordPress XML</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Publish to WordPress
            <MenubarShortcut>⇧⌘P</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>Unpublish</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="generate">
        <MenubarTrigger>Generate</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Rewrite section</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Outline</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="help">
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Docs</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
)

export const ViewMenubar = () => (
  <div className="p-2">
    <Menubar value="view" className="w-fit">
      <MenubarMenu value="post">
        <MenubarTrigger>Post</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New draft</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent onOpenAutoFocus={(e: Event) => e.preventDefault()}>
          <MenubarCheckboxItem checked>Show SEO panel</MenubarCheckboxItem>
          <MenubarCheckboxItem checked={false}>Show token usage</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel inset>Preview width</MenubarLabel>
          <MenubarRadioGroup value="desktop">
            <MenubarRadioItem value="desktop">Desktop</MenubarRadioItem>
            <MenubarRadioItem value="tablet">Tablet</MenubarRadioItem>
            <MenubarRadioItem value="mobile">Mobile</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>
            Reset layout
            <MenubarShortcut>⌥⌘R</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="sites">
        <MenubarTrigger>Sites</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>marketing-site.com</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  </div>
)
