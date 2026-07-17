import { Label, ToggleGroup, ToggleGroupItem } from 'autoblogr'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react'

export const SingleSelection = () => (
  <div className="grid gap-2">
    <Label>Publishing cadence</Label>
    {/* ToggleGroup's root is `justify-center` and stretches to its container,
        which would float the buttons away from the label — pin them left. */}
    <ToggleGroup type="single" defaultValue="weekly" variant="outline" className="justify-start">
      <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
      <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
      <ToggleGroupItem value="biweekly">Biweekly</ToggleGroupItem>
      <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
    </ToggleGroup>
  </div>
)

export const MultipleSelection = () => (
  <div className="grid gap-2">
    <Label>Text formatting</Label>
    <ToggleGroup
      type="multiple"
      defaultValue={['bold', 'underline']}
      variant="outline"
      className="justify-start"
    >
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <Underline />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
)

// variant axis — `default` items are transparent until pressed, `outline` keeps
// a border at rest.
export const Variants = () => (
  <div className="flex flex-col items-start gap-4">
    <ToggleGroup type="single" defaultValue="center" variant="default">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup type="single" defaultValue="center" variant="outline">
      <ToggleGroupItem value="left" aria-label="Align left">
        <AlignLeft />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        <AlignCenter />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Align right">
        <AlignRight />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-col items-start gap-3">
    <ToggleGroup type="single" defaultValue="short" variant="outline" size="sm">
      <ToggleGroupItem value="short">Short</ToggleGroupItem>
      <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
      <ToggleGroupItem value="long">Long-form</ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup type="single" defaultValue="medium" variant="outline" size="default">
      <ToggleGroupItem value="short">Short</ToggleGroupItem>
      <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
      <ToggleGroupItem value="long">Long-form</ToggleGroupItem>
    </ToggleGroup>
    <ToggleGroup type="single" defaultValue="long" variant="outline" size="lg">
      <ToggleGroupItem value="short">Short</ToggleGroupItem>
      <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
      <ToggleGroupItem value="long">Long-form</ToggleGroupItem>
    </ToggleGroup>
  </div>
)
