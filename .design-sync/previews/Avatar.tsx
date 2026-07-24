import { Avatar, AvatarFallback, AvatarImage } from 'autoblogr'

// AvatarImage needs a real src and the capture runs with no network, so a
// remote URL would always fail over to the fallback. This inline data: URI
// SVG stands in for an uploaded profile photo and loads offline.
const PHOTO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">' +
      '<rect width="80" height="80" fill="#1e293b"/>' +
      '<circle cx="40" cy="30" r="13" fill="#cbd5e1"/>' +
      '<path d="M13 80c0-15.5 12-25 27-25s27 9.5 27 25z" fill="#cbd5e1"/>' +
      '</svg>'
  )

export const Fallback = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarFallback>RB</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-medium leading-none">Ryan Balungeli</p>
      <p className="mt-1 text-muted-foreground">Owner · marketing-site.com</p>
    </div>
  </div>
)

export const WithImage = () => (
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={PHOTO} alt="Dana Okafor" />
      <AvatarFallback>DO</AvatarFallback>
    </Avatar>
    <div className="text-sm">
      <p className="font-medium leading-none">Dana Okafor</p>
      <p className="mt-1 text-muted-foreground">Editor · 12 posts published</p>
    </div>
  </div>
)

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <Avatar className="h-8 w-8">
      <AvatarFallback className="text-xs">RB</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback>RB</AvatarFallback>
    </Avatar>
    <Avatar className="h-12 w-12">
      <AvatarFallback className="text-lg">RB</AvatarFallback>
    </Avatar>
    <Avatar className="h-16 w-16">
      <AvatarFallback className="text-xl">RB</AvatarFallback>
    </Avatar>
  </div>
)

export const Group = () => (
  <div className="flex items-center gap-4">
    <div className="flex items-center">
      <Avatar className="ring-2 ring-background">
        <AvatarFallback>RB</AvatarFallback>
      </Avatar>
      <Avatar className="-ml-2 ring-2 ring-background">
        <AvatarImage src={PHOTO} alt="Dana Okafor" />
        <AvatarFallback>DO</AvatarFallback>
      </Avatar>
      <Avatar className="-ml-2 ring-2 ring-background">
        <AvatarFallback>MK</AvatarFallback>
      </Avatar>
      <Avatar className="-ml-2 ring-2 ring-background">
        <AvatarFallback className="text-xs">+3</AvatarFallback>
      </Avatar>
    </div>
    <p className="text-sm text-muted-foreground">6 authors on this content calendar</p>
  </div>
)
