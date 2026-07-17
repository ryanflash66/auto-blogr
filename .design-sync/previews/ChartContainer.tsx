import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from 'autoblogr'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const weekly = [
  { week: 'Jun 08', published: 6, drafts: 3 },
  { week: 'Jun 15', published: 9, drafts: 4 },
  { week: 'Jun 22', published: 7, drafts: 2 },
  { week: 'Jun 29', published: 12, drafts: 5 },
  { week: 'Jul 06', published: 10, drafts: 3 },
  { week: 'Jul 13', published: 14, drafts: 6 },
]

const barConfig = {
  published: { label: 'Published', color: 'hsl(var(--chart-1))' },
  drafts: { label: 'Drafts', color: 'hsl(var(--chart-2))' },
}

const areaConfig = {
  words: { label: 'Words generated', color: 'hsl(var(--chart-2))' },
}

const words = [
  { week: 'Jun 08', words: 7400 },
  { week: 'Jun 15', words: 11200 },
  { week: 'Jun 22', words: 8600 },
  { week: 'Jun 29', words: 15100 },
  { week: 'Jul 06', words: 12800 },
  { week: 'Jul 13', words: 17300 },
]

export const Bars = () => (
  <ChartContainer config={barConfig} className="h-56 w-full max-w-md">
    <BarChart data={weekly}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
      <YAxis tickLine={false} axisLine={false} width={28} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <Bar dataKey="published" fill="var(--color-published)" radius={4} isAnimationActive={false} />
      <Bar dataKey="drafts" fill="var(--color-drafts)" radius={4} isAnimationActive={false} />
    </BarChart>
  </ChartContainer>
)

export const WithLegend = () => (
  <ChartContainer config={barConfig} className="h-56 w-full max-w-md">
    <BarChart data={weekly}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar dataKey="published" stackId="a" fill="var(--color-published)" radius={[0, 0, 4, 4]} isAnimationActive={false} />
      <Bar dataKey="drafts" stackId="a" fill="var(--color-drafts)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
    </BarChart>
  </ChartContainer>
)

export const AreaTrend = () => (
  <ChartContainer config={areaConfig} className="h-56 w-full max-w-md">
    <AreaChart data={words}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <YAxis tickLine={false} axisLine={false} width={44} />
      <Area
        dataKey="words"
        type="natural"
        stroke="var(--color-words)"
        strokeWidth={2}
        fill="var(--color-words)"
        fillOpacity={0.25}
        isAnimationActive={false}
      />
    </AreaChart>
  </ChartContainer>
)

export const InContext = () => (
  <div className="w-full max-w-md rounded-lg border p-4">
    <div className="mb-1 flex items-baseline justify-between">
      <p className="text-sm font-medium">Publishing volume</p>
      <p className="text-xs text-muted-foreground">Last 6 weeks</p>
    </div>
    <p className="mb-3 text-2xl font-semibold tabular-nums">58 posts</p>
    <ChartContainer config={barConfig} className="h-48 w-full">
      <BarChart data={weekly}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
        <Bar dataKey="published" fill="var(--color-published)" radius={4} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  </div>
)
