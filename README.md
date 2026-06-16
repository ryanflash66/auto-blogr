# AutoBlogr

AI-powered blog content generator with WordPress publishing.

## Quick Start

```bash
# Install dependencies
npm install

# Start the app
npm run dev
```

That's it! The app runs locally with all data stored in your browser.

## AI Features (Optional)

To enable AI content generation, you need an **OpenRouter API key**:

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create a free account and get an API key
3. When you first try to generate content, you'll be prompted to enter it

Or set it in a `.env` file:
```
VITE_OPENROUTER_API_KEY=your_key_here
```

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
- Local Storage (data persistence)

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
