import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from 'autoblogr'
import {
  CalendarClock,
  FileText,
  Globe,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'

// cmdk renders inline, so a plain <Command> paints statically as-is.
// CommandDialog wraps it in a Dialog, which must be forced `open`; its
// onOpenAutoFocus is prevented so the search input's focus ring and text
// selection don't capture as an artifact.

export const CommandPalette = () => (
  <div className="p-2">
    <Command className="max-w-md rounded-lg border shadow-md">
      <CommandInput placeholder="Search posts, ideas, sites…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem>
            <Sparkles />
            <span>Generate blog post</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Lightbulb />
            <span>Brainstorm content ideas</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CalendarClock />
            <span>Schedule publishing run</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent drafts">
          <CommandItem>
            <FileText />
            <span>10 SEO Mistakes to Avoid</span>
          </CommandItem>
          <CommandItem>
            <FileText />
            <span>How We Cut Content Costs 40%</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
)

export const CommandWithSettings = () => (
  <div className="p-2">
    <Command className="max-w-md rounded-lg border shadow-md">
      <CommandInput placeholder="Type a command…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>
            <LayoutDashboard />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem>
            <Globe />
            <span>WordPress sites</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <KeyRound />
            <span>OpenRouter API key</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Default tone &amp; length</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
)

export const CommandDialogPalette = () => (
  <CommandDialog open>
    <CommandInput placeholder="Search posts, ideas, sites…" />
    <CommandList>
      <CommandEmpty>No results found.</CommandEmpty>
      <CommandGroup heading="Jump to">
        <CommandItem>
          <FileText />
          <span>Drafts</span>
        </CommandItem>
        <CommandItem>
          <Lightbulb />
          <span>Idea queue</span>
        </CommandItem>
        <CommandItem>
          <Globe />
          <span>marketing-site.com</span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        <CommandItem>
          <Sparkles />
          <span>Generate blog post</span>
          <CommandShortcut>⌘G</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
)
