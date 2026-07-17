import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'autoblogr'
import { CalendarDays, Globe } from 'lucide-react'

// `open` is set statically so the hover card paints inside the card — a
// hover-driven open state would capture as a bare trigger.

export const AuthorHoverCard = () => (
  <div className="p-2">
    <HoverCard open>
      <HoverCardTrigger asChild>
        <Button variant="link" className="px-0">
          @ryan.balungeli
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>RB</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">Ryan Balungeli</h4>
            <p className="text-sm text-muted-foreground">
              Author on 3 connected sites. 47 posts published through AutoBlogr.
            </p>
            <div className="flex items-center pt-1 text-xs text-muted-foreground">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Joined March 2024
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
)

export const SiteStatusHoverCard = () => (
  <div className="p-2">
    <HoverCard open>
      <HoverCardTrigger asChild>
        <Button variant="link" className="px-0">
          marketing-site.com
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="w-80">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">marketing-site.com</h4>
            </div>
            <Badge variant="secondary">Connected</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            WordPress 6.5 · REST API reachable. Last publish 2 days ago.
          </p>
          <p className="text-xs text-muted-foreground">Next scheduled post: Wed, 9:00 AM</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
)
