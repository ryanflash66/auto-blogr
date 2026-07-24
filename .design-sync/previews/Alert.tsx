import { Alert, AlertDescription, AlertTitle, Button } from 'autoblogr'
import { CircleAlert, KeyRound, Rocket } from 'lucide-react'

export const Default = () => (
  <Alert className="max-w-xl">
    <Rocket className="h-4 w-4" />
    <AlertTitle>Draft ready for review</AlertTitle>
    <AlertDescription>
      “Ten SEO mistakes that quietly cost you traffic” finished generating and is queued for
      marketing-site.com.
    </AlertDescription>
  </Alert>
)

export const Destructive = () => (
  <Alert variant="destructive" className="max-w-xl">
    <CircleAlert className="h-4 w-4" />
    <AlertTitle>Publishing failed</AlertTitle>
    <AlertDescription>
      WordPress rejected the request for marketing-site.com — the application password may have been
      revoked. Reconnect the site and retry the post.
    </AlertDescription>
  </Alert>
)

export const Variants = () => (
  <div className="max-w-xl space-y-4">
    <Alert>
      <AlertTitle>Scheduled for Tuesday, 9:00 AM</AlertTitle>
      <AlertDescription>
        Three posts will publish to marketing-site.com in your site’s local timezone.
      </AlertDescription>
    </Alert>
    <Alert variant="destructive">
      <AlertTitle>Image generation is over budget</AlertTitle>
      <AlertDescription>
        Your image provider returned a quota error. Posts will publish without a featured image until
        the quota resets.
      </AlertDescription>
    </Alert>
  </div>
)

export const WithAction = () => (
  <Alert className="max-w-xl">
    <KeyRound className="h-4 w-4" />
    <AlertTitle>Add your OpenRouter key</AlertTitle>
    <AlertDescription>
      <p>
        AutoBlogr generates content with your own API key, so nothing runs until a key is saved to
        your profile.
      </p>
      <div className="mt-3">
        <Button size="sm" variant="outline">
          Add API key
        </Button>
      </div>
    </AlertDescription>
  </Alert>
)
