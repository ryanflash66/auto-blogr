# AutoBlogr

AI-powered blog content generator with WordPress publishing.

## Quick Start

```bash
# Install dependencies
npm install

# Configure Supabase (required)
cp .env.example .env.local
# then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start the app
npm run dev
```

AutoBlogr uses **Supabase** for accounts and data: you sign in, and your ideas
and posts are stored in Postgres scoped to your user. The app cannot start
without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` — both are under
Project Settings → API in your Supabase dashboard. See `.env.example`.

## AI Features (Optional)

To enable AI content generation, you need an **OpenRouter API key**:

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create an account and get an API key
3. In the app, open **Profile**, paste it into **OpenRouter API key**, and save

The key is stored in your own Supabase profile row (only you can read it) and
is used for both text and hero images. There is no environment-variable
fallback: anything prefixed `VITE_` is bundled into the public JavaScript.

Hero images are generated through OpenRouter's image API with the same key and
saved to the public `hero-images` Supabase Storage bucket, under a folder named
after your user id. If image generation fails, the post is still saved, without
an image.

## WordPress Publishing

1. In WordPress, create an Application Password: **Users → Profile →
   Application Passwords**.
2. In the app, open **WordPress**, add the site (URL, username, that
   Application Password), and click **Test**.
3. Open a post in the editor, click **Publish**, and pick the site.

Publishing runs **in your browser**: the app calls the site's REST API
(`/wp-json/wp/v2/`) directly with Basic auth to upload the hero image, find or
create categories and tags, and create the post. So:

- The site must allow cross-origin REST requests from the app's domain (CORS).
  If **Test** fails with a network error while the credentials are right,
  CORS is the likely cause.
- The Application Password is stored in your `wordpress_sites` row. Row-level
  security limits it to your account, and it is sent to your browser when
  sites are listed.

A server-side publish path (a Supabase Edge Function) is planned only if
browser publishing proves unreliable (DAR-386).

## Features

- **Blog Ideas** - Create and organize content ideas
- **AI Generation** - Generate full blog posts with AI (requires API key)
- **Hero Images** - AI-generated images for your posts
- **WordPress Publishing** - Publish directly to WordPress sites
- **SEO Tools** - Built-in SEO analysis and optimization
- **Version History** - Track changes to your posts

## Tech Stack

- React 18 + Vite
- TailwindCSS + shadcn/ui
- OpenRouter (AI)
- Supabase (authentication and data persistence)

## WordPress Plugin (`wp-plugin/`)

The repo also includes a standalone WordPress plugin that exposes a custom REST
API for asynchronous post processing. In 30 seconds:

- **Custom REST API** under `autoblogr/v1`: `POST /jobs` to submit work,
  `GET /jobs/{id}` to read status (`wp-plugin/src/Rest/Controller.php`).
- **Auth**: WordPress Application Passwords identify the user, and every request
  must also carry an HMAC-SHA256 signature over the timestamp, method, path, and
  body, with a 300 second freshness window to block replay and tampering
  (`wp-plugin/src/Auth/Authenticator.php`, `wp-plugin/src/Hmac/Signer.php`).
- **Async flow**: a submit request returns a job id immediately and schedules
  the work with `wp_schedule_single_event` (WordPress deferred execution); when
  the job finishes it POSTs a signed result to the caller's `callback_url`
  (`wp-plugin/src/Jobs/PostProcessor.php`, `wp-plugin/src/Http/CallbackClient.php`).
- **Tests**: 43 PHPUnit tests, measured line coverage **98.85% (172/174)** via
  PCOV. CI enforces an 80 percent floor.
- **CI/CD**: GitHub Actions runs the suite on every push and PR that touches the
  plugin. Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

See [`wp-plugin/README.md`](wp-plugin/README.md) for details and run
instructions. The "async" processing uses WordPress cron style scheduling, not a
separate worker daemon.
