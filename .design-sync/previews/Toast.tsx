import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from 'autoblogr'

// Radix Toast renders nothing on its own: a <Toast> paints only inside a
// <ToastProvider> and portals into a <ToastViewport>, and only while it is
// open. Every cell composes that whole trio and forces `open` with
// `duration={Infinity}` so the toast can't auto-dismiss before capture.
// The viewport is position:fixed and anchors bottom-right of the nearest
// containing block, so each cell puts a page surface behind it — that is
// where these actually appear in the app.
function PageSurface({ title, children }) {
  return (
    <div className="h-64 rounded-lg border bg-muted/40 p-6">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{children}</p>
    </div>
  )
}

export const Default = () => (
  <ToastProvider>
    <PageSurface title="Content queue">
      4 drafts scheduled for marketing-site.com this week
    </PageSurface>
    <Toast open duration={Infinity}>
      <div className="grid gap-1">
        <ToastTitle>Post published</ToastTitle>
        <ToastDescription>
          “Ten SEO mistakes to avoid” is live on marketing-site.com.
        </ToastDescription>
      </div>
      <ToastClose />
    </Toast>
    <ToastViewport />
  </ToastProvider>
)

export const Destructive = () => (
  <ToastProvider>
    <PageSurface title="Content queue">
      4 drafts scheduled for marketing-site.com this week
    </PageSurface>
    <Toast open duration={Infinity} variant="destructive">
      <div className="grid gap-1">
        <ToastTitle>Publishing failed</ToastTitle>
        <ToastDescription>
          WordPress rejected the request — check the site’s application password.
        </ToastDescription>
      </div>
      <ToastClose />
    </Toast>
    <ToastViewport />
  </ToastProvider>
)

export const WithAction = () => (
  <ToastProvider>
    <PageSurface title="Content queue">
      4 drafts scheduled for marketing-site.com this week
    </PageSurface>
    <Toast open duration={Infinity} variant="destructive">
      <div className="grid gap-1">
        <ToastTitle>Generation stopped</ToastTitle>
        <ToastDescription>
          Your OpenRouter key hit its rate limit after 2 of 5 sections.
        </ToastDescription>
      </div>
      <ToastAction altText="Retry generating this post">Retry</ToastAction>
      <ToastClose />
    </Toast>
    <ToastViewport />
  </ToastProvider>
)

export const TitleOnly = () => (
  <ToastProvider>
    <PageSurface title="Blog idea saved">
      “Automating an editorial calendar with WordPress”
    </PageSurface>
    <Toast open duration={Infinity}>
      <div className="grid gap-1">
        <ToastTitle>Idea saved to your backlog</ToastTitle>
      </div>
      <ToastAction altText="Generate a draft from this idea">Generate</ToastAction>
      <ToastClose />
    </Toast>
    <ToastViewport />
  </ToastProvider>
)
