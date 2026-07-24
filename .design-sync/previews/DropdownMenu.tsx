import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'autoblogr'
import {
  CalendarClock,
  Copy,
  Ellipsis,
  ExternalLink,
  Eye,
  Pencil,
  Send,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'

// `open` is set statically so the menu paints inside the card — an
// interaction-driven open state would capture as a bare trigger button.
// onOpenAutoFocus is prevented because Radix otherwise focuses the first item
// and the focus ring captures as an artifact.

export const PostActionsMenu = () => (
  <div className="p-2">
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <DropdownMenuLabel>Draft actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Pencil />
            Edit draft
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Eye />
            Preview
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy />
            Duplicate
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Send />
            Publish now
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CalendarClock />
            Schedule…
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <ExternalLink />
            View on site
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 />
          Delete draft
          <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export const ColumnFilterMenu = () => (
  <div className="p-2">
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-52"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <DropdownMenuLabel inset>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked>Title</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>WordPress site</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked>SEO score</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>Word count</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false}>Tokens used</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel inset>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="updated">
          <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="score">SEO score</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title">Title A–Z</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)

export const ToneSubmenu = () => (
  <div className="p-2">
    <DropdownMenu open>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Generate</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <DropdownMenuLabel>New content</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset>Blog post from idea</DropdownMenuItem>
        <DropdownMenuItem inset>Outline only</DropdownMenuItem>
        <DropdownMenuSub open>
          <DropdownMenuSubTrigger inset>Tone of voice</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuItem>Conversational</DropdownMenuItem>
            <DropdownMenuItem>Authoritative</DropdownMenuItem>
            <DropdownMenuItem>Technical</DropdownMenuItem>
            <DropdownMenuItem>Playful</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset>
          Regenerate images
          <DropdownMenuShortcut>⇧⌘I</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)
