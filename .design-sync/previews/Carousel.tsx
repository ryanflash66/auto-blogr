import {
  Badge,
  Card,
  CardContent,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from 'autoblogr'

const ideas = [
  { title: 'Ten SEO mistakes to avoid', score: 92 },
  { title: 'Crawl budget 101', score: 84 },
  { title: 'Internal linking without busywork', score: 78 },
  { title: 'Repurposing changelogs into posts', score: 71 },
  { title: 'Topic clusters from one keyword', score: 66 },
]

export const Basic = () => (
  <div className="px-14">
    <Carousel className="w-full max-w-sm">
      <CarouselContent>
        {ideas.map((idea) => (
          <CarouselItem key={idea.title}>
            <Card>
              <CardContent className="flex h-36 flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-sm font-medium">{idea.title}</p>
                <p className="text-xs text-muted-foreground">Opportunity score {idea.score}</p>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
)

export const MultipleItems = () => (
  <div className="px-14">
    <Carousel opts={{ align: 'start' }} className="w-full max-w-sm">
      <CarouselContent>
        {ideas.map((idea) => (
          <CarouselItem key={idea.title} className="basis-1/2">
            <Card>
              <CardContent className="flex h-28 flex-col justify-between p-4">
                <p className="text-sm font-medium leading-tight">{idea.title}</p>
                <Badge variant="secondary" className="w-fit">
                  Score {idea.score}
                </Badge>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
)

export const InContext = () => (
  <div className="w-full max-w-md rounded-lg border p-4 pb-4">
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Suggested ideas</p>
        <p className="text-xs text-muted-foreground">marketing-site.com · refreshed today</p>
      </div>
      <Badge variant="secondary">5 new</Badge>
    </div>
    <div className="px-12">
      <Carousel opts={{ align: 'start' }} className="w-full">
        <CarouselContent>
          {ideas.map((idea) => (
            <CarouselItem key={idea.title}>
              <div className="rounded-md border bg-muted p-4">
                <p className="text-sm font-medium">{idea.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Est. 1,200 words · opportunity score {idea.score}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  </div>
)
