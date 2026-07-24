import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  Label,
} from 'autoblogr'
import { FileText, Globe, LayoutDashboard, Lightbulb, Sparkles, User } from 'lucide-react'

// SidebarInput is a sub-part: on its own it's a bare 32px-tall input box with no
// context. The only honest preview puts it where it belongs — in the header or a
// group of a real Sidebar, which also supplies the SidebarProvider it needs.

export const SearchInSidebarHeader = () => (
  <div className="h-96 w-full overflow-hidden rounded-lg border">
    <SidebarProvider className="h-full min-h-0">
      <Sidebar collapsible="none" className="border-r border-sidebar-border">
        <SidebarHeader className="gap-3">
          <div className="flex items-center gap-2 px-2 pt-1">
            <div className="flex size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="size-3" />
            </div>
            <span className="text-sm font-semibold">AutoBlogr</span>
          </div>
          <Label htmlFor="sidebar-search" className="sr-only">
            Search posts
          </Label>
          <SidebarInput
            id="sidebar-search"
            placeholder="Search posts and ideas…"
            defaultValue=""
          />
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
                    <FileText />
                    <span>Posts</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Globe />
                    <span>WordPress</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <User />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">
          SidebarInput sits in the SidebarHeader as the workspace search field.
        </p>
      </main>
    </SidebarProvider>
  </div>
)

export const FilterWithValue = () => (
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
            <SidebarGroupLabel>Filter posts</SidebarGroupLabel>
            <SidebarGroupContent className="pt-1">
              <SidebarInput defaultValue="editorial calendar" />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>3 matches</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <FileText />
                    <span>Automate your editorial calendar</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText />
                    <span>Editorial calendar templates</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Lightbulb />
                    <span>Calendar ideas for Q3</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="flex min-w-0 flex-1 items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">
          The same input filtering a group — shown with a value typed in.
        </p>
      </main>
    </SidebarProvider>
  </div>
)
