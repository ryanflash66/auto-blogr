import { Label, RadioGroup, RadioGroupItem } from 'autoblogr'

export const Basic = () => (
  <div className="flex flex-col gap-3">
    <Label>Publishing action</Label>
    <RadioGroup defaultValue="review">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="draft" id="pub-draft" />
        <Label htmlFor="pub-draft" className="font-normal">
          Save as draft
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="review" id="pub-review" />
        <Label htmlFor="pub-review" className="font-normal">
          Send to review queue
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="publish" id="pub-publish" />
        <Label htmlFor="pub-publish" className="font-normal">
          Publish immediately
        </Label>
      </div>
    </RadioGroup>
  </div>
)

export const Horizontal = () => (
  <div className="flex flex-col gap-3">
    <Label>Tone</Label>
    <RadioGroup defaultValue="practical" orientation="horizontal" className="flex flex-wrap gap-6">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="practical" id="tone-practical" />
        <Label htmlFor="tone-practical" className="font-normal">
          Practical
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="conversational" id="tone-conversational" />
        <Label htmlFor="tone-conversational" className="font-normal">
          Conversational
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="authoritative" id="tone-authoritative" />
        <Label htmlFor="tone-authoritative" className="font-normal">
          Authoritative
        </Label>
      </div>
    </RadioGroup>
  </div>
)

export const WithDescriptions = () => (
  <RadioGroup defaultValue="balanced" className="max-w-md gap-3">
    <div className="flex items-start gap-3 rounded-md border border-input p-4">
      <RadioGroupItem value="fast" id="model-fast" className="mt-0.5" />
      <div className="grid gap-1.5">
        <Label htmlFor="model-fast">Fast drafts</Label>
        <p className="text-sm text-muted-foreground">
          Cheapest per post. Good for outlines and listicles.
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3 rounded-md border border-input p-4">
      <RadioGroupItem value="balanced" id="model-balanced" className="mt-0.5" />
      <div className="grid gap-1.5">
        <Label htmlFor="model-balanced">Balanced</Label>
        <p className="text-sm text-muted-foreground">
          The default. Long-form posts with usable structure and citations.
        </p>
      </div>
    </div>
    <div className="flex items-start gap-3 rounded-md border border-input p-4">
      <RadioGroupItem value="deep" id="model-deep" className="mt-0.5" />
      <div className="grid gap-1.5">
        <Label htmlFor="model-deep">Deep research</Label>
        <p className="text-sm text-muted-foreground">
          Slowest and most expensive. Use for pillar pages.
        </p>
      </div>
    </div>
  </RadioGroup>
)

export const Disabled = () => (
  <div className="flex flex-col gap-3">
    <Label className="text-muted-foreground">Image provider</Label>
    <RadioGroup defaultValue="none" disabled>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="none" id="img-none" />
        <Label htmlFor="img-none" className="font-normal">
          No images
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="replicate" id="img-replicate" />
        <Label htmlFor="img-replicate" className="font-normal">
          Replicate
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="openai" id="img-openai" />
        <Label htmlFor="img-openai" className="font-normal">
          OpenAI Images
        </Label>
      </div>
    </RadioGroup>
    <p className="text-sm text-muted-foreground">Add an image provider key in Settings to choose.</p>
  </div>
)
