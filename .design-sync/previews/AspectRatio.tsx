import { AspectRatio, Badge } from 'autoblogr'
import { ImageIcon } from 'lucide-react'

const hero = (title: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="540" cy="70" r="120" fill="#64748b" opacity="0.35"/>
      <circle cx="90" cy="320" r="90" fill="#94a3b8" opacity="0.25"/>
      <text x="40" y="200" fill="#f8fafc" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="600">${title}</text>
      <text x="40" y="240" fill="#cbd5e1" font-family="Inter, system-ui, sans-serif" font-size="20">AI-generated featured image</text>
    </svg>`
  )

const squareHero =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#475569"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#s)"/>
      <circle cx="330" cy="80" r="90" fill="#64748b" opacity="0.35"/>
      <circle cx="60" cy="350" r="70" fill="#94a3b8" opacity="0.25"/>
      <text x="32" y="196" fill="#f8fafc" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="600">Editorial</text>
      <text x="32" y="232" fill="#f8fafc" font-family="Inter, system-ui, sans-serif" font-size="30" font-weight="600">calendar</text>
      <text x="32" y="266" fill="#cbd5e1" font-family="Inter, system-ui, sans-serif" font-size="17">AI-generated social image</text>
    </svg>`
  )

export const Widescreen = () => (
  <div className="w-full max-w-md">
    <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md border">
      <img
        src={hero('Ten SEO mistakes')}
        alt="Featured image for Ten SEO mistakes to avoid"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
    <p className="mt-2 text-xs text-muted-foreground">16 / 9 · featured image · marketing-site.com</p>
  </div>
)

export const Square = () => (
  <div className="w-full max-w-xs">
    <AspectRatio ratio={1} className="overflow-hidden rounded-md border">
      <img
        src={squareHero}
        alt="Square social thumbnail for the editorial calendar post"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
    <p className="mt-2 text-xs text-muted-foreground">1 / 1 · social thumbnail</p>
  </div>
)

export const Placeholder = () => (
  <div className="w-full max-w-md">
    <AspectRatio
      ratio={16 / 9}
      className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted"
    >
      <ImageIcon className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No featured image yet</p>
    </AspectRatio>
    <p className="mt-2 text-xs text-muted-foreground">Generated once the draft is approved</p>
  </div>
)

export const InContext = () => (
  <div className="w-full max-w-sm overflow-hidden rounded-lg border">
    <AspectRatio ratio={16 / 9}>
      <img
        src={hero('Crawl budget 101')}
        alt="Featured image for Crawl budget 101"
        className="h-full w-full object-cover"
      />
    </AspectRatio>
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">Crawl budget 101</p>
        <Badge variant="secondary">Draft</Badge>
      </div>
      <p className="text-xs text-muted-foreground">blog.acme-docs.dev · 1,610 words · SEO 74</p>
    </div>
  </div>
)
