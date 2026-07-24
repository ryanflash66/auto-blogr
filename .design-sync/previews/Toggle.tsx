import { Toggle } from 'autoblogr'
import { Bold, Eye, Italic, Link2, Pin, Sparkles, Underline } from 'lucide-react'

// variant axis, swept across both pressed states — an unpressed `default`
// toggle is transparent by design, so each variant is shown off and on.
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle variant="default">
      <Sparkles />
      Auto-SEO
    </Toggle>
    <Toggle variant="default" defaultPressed>
      <Sparkles />
      Auto-SEO
    </Toggle>
    <Toggle variant="outline">
      <Pin />
      Featured
    </Toggle>
    <Toggle variant="outline" defaultPressed>
      <Pin />
      Featured
    </Toggle>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle variant="outline" size="sm">
      Draft
    </Toggle>
    <Toggle variant="outline" size="default">
      Scheduled
    </Toggle>
    <Toggle variant="outline" size="lg">
      Published
    </Toggle>
  </div>
)

export const EditorToolbar = () => (
  <div className="flex w-fit items-center gap-1 rounded-md border border-input p-1">
    <Toggle size="sm" defaultPressed aria-label="Bold">
      <Bold />
    </Toggle>
    <Toggle size="sm" aria-label="Italic">
      <Italic />
    </Toggle>
    <Toggle size="sm" aria-label="Underline">
      <Underline />
    </Toggle>
    <Toggle size="sm" aria-label="Insert link">
      <Link2 />
    </Toggle>
  </div>
)

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Toggle variant="outline" disabled>
      <Eye />
      Live preview
    </Toggle>
    <Toggle variant="outline" defaultPressed disabled>
      <Sparkles />
      Auto-SEO
    </Toggle>
  </div>
)
