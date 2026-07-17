import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from 'autoblogr'

const posts = [
  { title: 'Ten SEO mistakes to avoid', status: 'Published', words: 1240, date: '16 Jul 2026' },
  { title: 'Crawl budget 101', status: 'Draft', words: 1610, date: '15 Jul 2026' },
  { title: 'How we automated our editorial calendar', status: 'Scheduled', words: 980, date: '18 Jul 2026' },
  { title: 'A friendlier tone for technical posts', status: 'Failed', words: 1105, date: '14 Jul 2026' },
  { title: 'Internal linking without the busywork', status: 'Published', words: 1385, date: '11 Jul 2026' },
]

const statusVariant = (status: string) =>
  status === 'Published'
    ? undefined
    : status === 'Failed'
      ? ('destructive' as const)
      : status === 'Scheduled'
        ? ('outline' as const)
        : ('secondary' as const)

export const Posts = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Words</TableHead>
        <TableHead className="text-right">Date</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {posts.map((post) => (
        <TableRow key={post.title}>
          <TableCell className="font-medium">{post.title}</TableCell>
          <TableCell>
            <Badge variant={statusVariant(post.status)}>{post.status}</Badge>
          </TableCell>
          <TableCell className="text-right tabular-nums">{post.words.toLocaleString()}</TableCell>
          <TableCell className="text-right text-muted-foreground">{post.date}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export const WithCaptionAndFooter = () => (
  <Table>
    <TableCaption>Posts generated this week across all connected sites.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Site</TableHead>
        <TableHead className="text-right">Posts</TableHead>
        <TableHead className="text-right">Words</TableHead>
        <TableHead className="text-right">Avg SEO</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">marketing-site.com</TableCell>
        <TableCell className="text-right tabular-nums">6</TableCell>
        <TableCell className="text-right tabular-nums">7,410</TableCell>
        <TableCell className="text-right tabular-nums">87</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">blog.acme-docs.dev</TableCell>
        <TableCell className="text-right tabular-nums">4</TableCell>
        <TableCell className="text-right tabular-nums">5,980</TableCell>
        <TableCell className="text-right tabular-nums">74</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">shop.northwind.io</TableCell>
        <TableCell className="text-right tabular-nums">3</TableCell>
        <TableCell className="text-right tabular-nums">3,240</TableCell>
        <TableCell className="text-right tabular-nums">81</TableCell>
      </TableRow>
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell>Total</TableCell>
        <TableCell className="text-right tabular-nums">13</TableCell>
        <TableCell className="text-right tabular-nums">16,630</TableCell>
        <TableCell className="text-right tabular-nums">81</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
)

export const InContext = () => (
  <div className="rounded-lg border">
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm font-medium">Recent posts</p>
        <p className="text-xs text-muted-foreground">marketing-site.com</p>
      </div>
      <Badge variant="secondary">Auto-publish on</Badge>
    </div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">SEO</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {posts.slice(0, 3).map((post) => (
          <TableRow key={post.title}>
            <TableCell className="font-medium">{post.title}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(post.status)}>{post.status}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {post.status === 'Failed' ? '—' : 74 + post.words % 20}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)
