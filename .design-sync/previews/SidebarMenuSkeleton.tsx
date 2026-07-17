import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from 'autoblogr'
import { FileText, Globe, LayoutDashboard, Lightbulb, Sparkles, User } from 'lucide-react'

// SidebarMenuSkeleton is a sub-part: one alone is an 8px grey bar with no context.
// The honest preview is a whole SidebarMenu of them — the loading state of the nav
// while the workspace is fetched — inside the SidebarProvider they require.

export const LoadingNavigation = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <Sidebar collapsible="none" className="border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="text-sm font-semibold">AutoBlogr</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">
          Nav placeholder while the workspace loads — showIcon keeps the rail aligned.
        </p>
      </main>
    </SidebarProvider>
  </div>
)

export const LoadedNavPendingPosts = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <Sidebar collapsible="none" className="border-r border-sidebar-border">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="text-sm font-semibold">AutoBlogr</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Lightbulb />
                    <span>Ideas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Globe />
                    <span>WordPress</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Recent posts</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText />
                    <span>Automate your editorial calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">
          Nav resolved, recent posts still streaming in — showIcon omitted for text rows.
        </p>
      </main>
    </SidebarProvider>
  </div>
)
