import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'autoblogr'
import { CheckCircle2, Clock, FileText } from 'lucide-react'

export const Basic = () => (
  <Card className="max-w-md">
    <CardHeader>
      <CardTitle>Ten SEO mistakes to avoid</CardTitle>
      <CardDescription>
        A long-form guide covering the technical and on-page errors that quietly cost organic traffic.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Drafted from your saved idea “SEO audit checklist”. Roughly 1,800 words with an outline,
        introduction, and eight sub-sections ready for review.
      </p>
    </CardContent>
    <CardFooter className="gap-2">
      <Button size="sm">Publish</Button>
      <Button size="sm" variant="outline">
        Edit draft
      </Button>
    </CardFooter>
  </Card>
)

export const WithMeta = () => (
  <Card className="max-w-md">
    <CardHeader>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle>How we automated our blog</CardTitle>
          <CardDescription>Published to marketing-site.com</CardDescription>
        </div>
        <Badge>
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Published
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <FileText className="h-4 w-4" />
        1,240 words
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" />6 min read
      </span>
    </CardContent>
  </Card>
)

export const Stats = () => (
  <div className="grid gap-4 sm:grid-cols-2">
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Ideas captured</CardDescription>
        <CardTitle className="text-3xl">48</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">12 added this week</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Posts published</CardDescription>
        <CardTitle className="text-3xl">17</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Across 3 connected sites</p>
      </CardContent>
    </Card>
  </div>
)

export const Empty = () => (
  <Card className="max-w-md border-dashed">
    <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <FileText className="h-10 w-10 text-muted-foreground/50" />
      <div className="space-y-1">
        <p className="font-medium">No posts yet</p>
        <p className="text-sm text-muted-foreground">
          Generate content from a blog idea to see it here.
        </p>
      </div>
      <Button size="sm" variant="outline">
        Browse ideas
      </Button>
    </CardContent>
  </Card>
)
