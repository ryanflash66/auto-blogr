import { Button } from 'autoblogr'
import { Plus, Sparkles, Trash2, Loader2, ArrowRight } from 'lucide-react'

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Publish post</Button>
    <Button variant="secondary">Save draft</Button>
    <Button variant="outline">Preview</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="destructive">Delete</Button>
    <Button variant="link">View on site</Button>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon" aria-label="Add idea">
      <Plus />
    </Button>
  </div>
)

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>
      <Sparkles />
      Generate content
    </Button>
    <Button variant="outline">
      Next step
      <ArrowRight />
    </Button>
    <Button variant="destructive" size="sm">
      <Trash2 />
      Delete idea
    </Button>
  </div>
)

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>Disabled</Button>
    <Button variant="outline" disabled>
      Disabled outline
    </Button>
    <Button disabled>
      <Loader2 className="animate-spin" />
      Generating…
    </Button>
  </div>
)
