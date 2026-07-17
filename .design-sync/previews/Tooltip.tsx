import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'autoblogr'
import { RefreshCw, Sparkles } from 'lucide-react'

// TooltipProvider is composed into each export rather than assumed from the
// app shell. `open` is set statically so the tooltip paints inside the card —
// a hover-driven open state would capture as a bare trigger button.

// side="top" — the default.
export const RegenerateTooltip = () => (
  <div className="p-10">
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Regenerate this draft</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

// side="right" — on a labelled action button.
export const GenerateDraftTooltip = () => (
  <div className="p-10">
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate draft
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Uses your OpenRouter key · ~$0.04 per post</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

// side="bottom" — explaining a disabled control.
export const DisabledPublishTooltip = () => (
  <div className="p-10">
    <TooltipProvider>
      <Tooltip open>
        {/* A disabled button fires no pointer events, so the trigger is an
            inline-block wrapper — the standard shadcn workaround. */}
        <TooltipTrigger asChild>
          <span className="inline-block" tabIndex={0}>
            <Button disabled>Publish to WordPress</Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          <p>Connect a WordPress site first</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)
