import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from 'autoblogr'

// The panel only paints while a menu is open, so pin it open with the
// controlled `value` prop matching a NavigationMenuItem's `value`.
// The content renders into the viewport rendered below the Root.
export const PrimaryNavOpen = () => (
  <div className="pb-56">
    <NavigationMenu value="posts">
      <NavigationMenuList>
        <NavigationMenuItem value="posts">
          <NavigationMenuTrigger>Posts</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-96 gap-3 p-4 md:grid-cols-2">
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none text-foreground">All posts</div>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    Every draft, scheduled and published article.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none text-foreground">Scheduled</div>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    Queued for publication on your WordPress sites.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none text-foreground">Ideas</div>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    Keyword-researched topics waiting to be written.
                  </p>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="text-sm font-medium leading-none text-foreground">Templates</div>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">
                    Reusable outlines and tone-of-voice presets.
                  </p>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="sites">
          <NavigationMenuTrigger>WordPress Sites</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-3 p-4">
              <li className="text-sm text-foreground">gardenjournal.blog</li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
            Profile
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  </div>
)

// Link-only bar: no triggers, no panels. Apply navigationMenuTriggerStyle() to
// each NavigationMenuLink so plain destinations match trigger sizing, and mark
// the current page with `active` (styled via data-[active]).
export const LinkOnlyBar = () => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuLink href="#" active className={navigationMenuTriggerStyle()}>
          Dashboard
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
          Ideas
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
          Posts
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>
          Profile
        </NavigationMenuLink>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
)
