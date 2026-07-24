import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from 'autoblogr'

// Radix keeps SelectContent's children in a detached fragment while closed, so
// SelectValue still resolves the selected item's text on a closed trigger.
export const WithValue = () => (
  <div className="grid w-64 gap-2">
    <Label htmlFor="tone">Writing tone</Label>
    <Select defaultValue="conversational">
      <SelectTrigger id="tone">
        <SelectValue placeholder="Choose a tone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="professional">Professional</SelectItem>
        <SelectItem value="conversational">Conversational</SelectItem>
        <SelectItem value="authoritative">Authoritative</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export const States = () => (
  <div className="flex flex-wrap items-end gap-4">
    <div className="grid w-56 gap-2">
      <Label htmlFor="site">Target site</Label>
      <Select>
        <SelectTrigger id="site">
          <SelectValue placeholder="Select a WordPress site" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="marketing">marketing-site.com</SelectItem>
          <SelectItem value="devblog">devblog.io</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="grid w-56 gap-2">
      <Label htmlFor="provider">Image provider</Label>
      <Select disabled defaultValue="replicate">
        <SelectTrigger id="provider">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="replicate">Replicate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
)

// `open` is set statically so the listbox paints; an interaction-driven open
// state would capture as a bare trigger. Radix portals the content out of the
// card, which is fine for a full-bleed capture.
export const OpenMenu = () => (
  <div className="grid w-64 gap-2">
    <Label htmlFor="model">Generation model</Label>
    <Select open defaultValue="claude-sonnet">
      <SelectTrigger id="model">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Anthropic</SelectLabel>
          <SelectItem value="claude-sonnet">Claude Sonnet 4.5</SelectItem>
          <SelectItem value="claude-haiku">Claude Haiku 4.5</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>OpenAI</SelectLabel>
          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
          <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
