import { Skeleton } from 'autoblogr'

export const PostCard = () => (
  <div className="max-w-md space-y-4 rounded-lg border p-6">
    <Skeleton className="h-40 w-full rounded-md" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-24 rounded-md" />
      <Skeleton className="h-9 w-24 rounded-md" />
    </div>
  </div>
)

export const ArticleBody = () => (
  <div className="max-w-md space-y-6">
    <div className="space-y-3">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-3 w-40" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
)

export const IdeaQueue = () => (
  <div className="max-w-xl space-y-3">
    {[0, 1, 2].map((row) => (
      <div key={row} className="flex items-center gap-4 rounded-lg border p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
)

export const StatTiles = () => (
  <div className="grid max-w-xl gap-4 sm:grid-cols-2">
    {[0, 1].map((tile) => (
      <div key={tile} className="space-y-3 rounded-lg border p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    ))}
  </div>
)
