import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  Avatar,
  AvatarFallback,
  Badge,
} from 'autoblogr'
import {
  ChevronsUpDown,
  FileText,
  Globe,
  LayoutDashboard,
  Lightbulb,
  PenLine,
  Settings,
  Sparkles,
  User,
} from 'lucide-react'

// Every Sidebar* part reads useSidebar(), so SidebarProvider is composed inside
// each export. The provider wrapper is min-h-svh by default — these cards bound
// it to a fixed height so the card shows an app shell instead of a viewport bleed.

const AutoBlogrMark = () => (
  <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
    <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
      <Sparkles className="size-4" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold leading-tight">AutoBlogr</span>
      <span className="text-xs text-sidebar-foreground/70 leading-tight">
        Pro workspace
      </span>
    </div>
  </div>
)

const NavGroup = () => (
  <SidebarGroup>
    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive tooltip="Dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Ideas">
            <Lightbulb />
            <span>Ideas</span>
          </SidebarMenuButton>
          <SidebarMenuBadge>12</SidebarMenuBadge>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Posts">
            <FileText />
            <span>Posts</span>
          </SidebarMenuButton>
          <SidebarMenuBadge>34</SidebarMenuBadge>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="WordPress">
            <Globe />
            <span>WordPress</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Profile">
            <User />
            <span>Profile</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)

const UserFooter = () => (
  <SidebarFooter>
    <SidebarSeparator />
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip="Account">
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md text-xs">RB</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium leading-tight">Ryan Balungeli</span>
            <span className="text-xs text-sidebar-foreground/70 leading-tight">
              ry.balungeli@gmail.com
            </span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarFooter>
)

export const AppShell = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <Sidebar collapsible="none" className="border-r border-sidebar-border">
        <SidebarHeader>
          <AutoBlogrMark />
        </SidebarHeader>
        <SidebarContent>
          <NavGroup />
        </SidebarContent>
        <UserFooter />
      </Sidebar>
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <span className="text-sm font-medium">Dashboard</span>
          <Badge variant="secondary" className="ml-auto">
            3 drafts queued
          </Badge>
        </header>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Published</p>
              <p className="text-2xl font-semibold">128</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-semibold">9</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Ideas pending</p>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">Latest generation</p>
            <p className="text-sm text-muted-foreground">
              “Seven ways to automate your editorial calendar” — drafted via
              OpenRouter, awaiting review.
            </p>
          </div>
        </div>
      </main>
    </SidebarProvider>
  </div>
)

export const WithGroupedNavigation = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <Sidebar collapsible="none">
        <SidebarHeader>
          <AutoBlogrMark />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Content</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Lightbulb />
                    <span>Ideas</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>12</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <FileText />
                    <span>Posts</span>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>34</SidebarMenuBadge>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Publishing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Globe />
                    <span>WordPress</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <PenLine />
                    <span>Templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>API keys</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">
          Grouped navigation — one SidebarGroup per area of the product.
        </p>
      </main>
    </SidebarProvider>
  </div>
)

export const DockedRight = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <main className="flex min-w-0 flex-1 flex-col bg-background p-4">
        <p className="text-sm font-medium">Post editor</p>
        <p className="mt-1 text-sm text-muted-foreground">
          “Seven ways to automate your editorial calendar”
        </p>
        <div className="mt-3 flex flex-1 flex-col gap-2 rounded-lg border p-3">
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-3/4 rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-2/3 rounded bg-muted" />
        </div>
      </main>
      {/* collapsible="none" renders in flow, so docking right is DOM order — the
          `side` prop only steers the fixed/off-canvas variants. */}
      <Sidebar collapsible="none" className="border-l border-sidebar-border">
        <SidebarHeader>
          <div className="px-2 py-1.5 text-sm font-semibold">Publish settings</div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Destination</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Globe />
                    <span>blog.autoblogr.io</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText />
                    <span>Save as draft</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="px-2 pb-1 text-xs text-sidebar-foreground/70">
            Last synced 4 minutes ago
          </p>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  </div>
)
