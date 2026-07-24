import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from 'autoblogr'

export const Default = () => (
  <div className="max-w-md space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium">Generating “Ten SEO mistakes to avoid”</span>
      <span className="tabular-nums text-muted-foreground">62%</span>
    </div>
    <Progress value={62} />
    <p className="text-xs text-muted-foreground">Step 3 of 5 — drafting section bodies</p>
  </div>
)

export const Values = () => (
  <div className="max-w-md space-y-4">
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Queued</span>
        <span className="tabular-nums">0%</span>
      </div>
      <Progress value={0} />
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Researching keywords</span>
        <span className="tabular-nums">35%</span>
      </div>
      <Progress value={35} />
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Published</span>
        <span className="tabular-nums">100%</span>
      </div>
      <Progress value={100} />
    </div>
  </div>
)

export const InContext = () => (
  <Card className="max-w-md">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg">Monthly post quota</CardTitle>
      <CardDescription>Resets on 1 June across all connected sites</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">marketing-site.com</span>
          <span className="tabular-nums">17 / 20</span>
        </div>
        <Progress value={85} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">blog.acme-docs.dev</span>
          <span className="tabular-nums">4 / 20</span>
        </div>
        <Progress value={20} />
      </div>
    </CardContent>
  </Card>
)
