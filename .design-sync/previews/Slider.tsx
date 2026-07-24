import { Label, Slider } from 'autoblogr'

export const Basic = () => (
  <div className="flex max-w-md flex-col gap-3">
    <Label htmlFor="wordcount">Target word count</Label>
    <Slider id="wordcount" defaultValue={[1200]} min={400} max={3000} step={100} />
  </div>
)

export const WithValueLabel = () => (
  <div className="flex max-w-md flex-col gap-3">
    <div className="flex items-center justify-between">
      <Label htmlFor="creativity">Creativity</Label>
      <span className="text-sm text-muted-foreground tabular-nums">0.7</span>
    </div>
    <Slider id="creativity" defaultValue={[0.7]} min={0} max={1} step={0.1} />
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Predictable</span>
      <span>Inventive</span>
    </div>
  </div>
)

export const Positions = () => (
  <div className="grid max-w-md gap-6">
    <div className="flex flex-col gap-2">
      <Label htmlFor="pos-min">Minimum — 400 words</Label>
      <Slider id="pos-min" defaultValue={[400]} min={400} max={3000} step={100} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="pos-mid">Midpoint — 1,700 words</Label>
      <Slider id="pos-mid" defaultValue={[1700]} min={400} max={3000} step={100} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="pos-max">Maximum — 3,000 words</Label>
      <Slider id="pos-max" defaultValue={[3000]} min={400} max={3000} step={100} />
    </div>
  </div>
)

export const Steps = () => (
  <div className="flex max-w-md flex-col gap-3">
    <div className="flex items-center justify-between">
      <Label htmlFor="posts-per-week">Posts per week</Label>
      <span className="text-sm text-muted-foreground tabular-nums">3</span>
    </div>
    <Slider id="posts-per-week" defaultValue={[3]} min={1} max={7} step={1} />
    <div className="flex items-center justify-between text-sm text-muted-foreground tabular-nums">
      <span>1</span>
      <span>7</span>
    </div>
    <p className="text-sm text-muted-foreground">
      Whole posts only — <code className="font-mono">step={'{1}'}</code> snaps the thumb to each day.
    </p>
  </div>
)
