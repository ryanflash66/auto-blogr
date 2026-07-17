import { Calendar } from 'autoblogr'

// Fixed dates keep the captured grid deterministic across runs.
const JULY_2026 = new Date(2026, 6, 1)

export const PublishDate = () => (
  <Calendar
    mode="single"
    selected={new Date(2026, 6, 22)}
    defaultMonth={JULY_2026}
    className="w-fit rounded-md border"
  />
)

export const ContentWindow = () => (
  <Calendar
    mode="range"
    selected={{ from: new Date(2026, 6, 13), to: new Date(2026, 6, 19) }}
    defaultMonth={JULY_2026}
    className="w-fit rounded-md border"
  />
)

export const ScheduledDrops = () => (
  <Calendar
    mode="multiple"
    selected={[new Date(2026, 6, 7), new Date(2026, 6, 14), new Date(2026, 6, 21), new Date(2026, 6, 28)]}
    defaultMonth={JULY_2026}
    className="w-fit rounded-md border"
  />
)

export const NoBackdating = () => (
  <Calendar
    mode="single"
    selected={new Date(2026, 6, 24)}
    defaultMonth={JULY_2026}
    disabled={{ before: new Date(2026, 6, 16) }}
    className="w-fit rounded-md border"
  />
)
