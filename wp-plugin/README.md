# AutoBlogr API (WordPress plugin)

A WordPress plugin that exposes a custom REST API for submitting blog posts to
be processed asynchronously, with signed requests and a signed completion
callback.

## What it does

### Custom REST API

Registered under the `autoblogr/v1` namespace
(`src/Rest/Controller.php`):

- `POST /autoblogr/v1/jobs` submits a job and returns `202 Accepted` with a job id.
- `GET /autoblogr/v1/jobs/{id}` returns the status and result of a job.

### Authentication: Application Password plus HMAC signing

Two layers, both required (`src/Auth/Authenticator.php`, `src/Hmac/Signer.php`):

1. WordPress core verifies a standard **Application Password** (HTTP Basic auth)
   and resolves the current user. Requests without a logged-in user get `401`.
2. On top of that, every request must carry two headers:
   - `X-AutoBlogr-Timestamp`: unix time of the request.
   - `X-AutoBlogr-Signature`: hex HMAC-SHA256 over
     `timestamp\nMETHOD\npath\nbody`, keyed with the user's per-user signing
     secret (stored in user meta).

   The signature is checked with a constant-time comparison, and the timestamp
   must fall within a 300 second window, which rejects replayed and tampered
   requests.

### Asynchronous processing with a completion callback

`src/Jobs/PostProcessor.php`:

- `enqueue()` validates the input, stores a `queued` job, and schedules the
  work with `wp_schedule_single_event`. The HTTP request returns immediately
  with the job id. The processing runs later on the `autoblogr_run_job` hook,
  which is WordPress's native deferred execution mechanism, so it is
  asynchronous from the caller's point of view rather than running inside the
  submitting request.
- `run()` performs the work (slug, word count, excerpt), marks the job
  `completed`, and POSTs a signed result to the caller-supplied `callback_url`
  via `src/Http/CallbackClient.php`. The callback body is signed with the same
  HMAC scheme so the receiver can verify it.

This uses WordPress cron style scheduling. It is not a separate queue daemon or
worker process.

## Tests and coverage

Unit tests run with PHPUnit and Brain Monkey (which mocks WordPress core
functions, so no WordPress install is needed to run them).

```bash
cd wp-plugin
composer install
vendor/bin/phpunit --coverage-text
```

Measured line coverage is **98.85% (172 of 174 lines)** across 43 tests, using
the PCOV driver. The figure above is the real measured number from this suite.
CI enforces a floor of 80 percent line coverage.

## CI/CD

GitHub Actions runs the suite and the coverage floor check on every push and
pull request that touches the plugin. The workflow is at
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Layout

```
wp-plugin/
  autoblogr-api.php        Plugin bootstrap and hook wiring
  src/
    Hmac/Signer.php        HMAC-SHA256 sign and verify
    Auth/Authenticator.php Signature plus timestamp verification
    Rest/Controller.php    REST route registration and handlers
    Jobs/PostProcessor.php Enqueue, process, fire callback
    Jobs/JobStore.php      Job persistence interface
    Jobs/OptionJobStore.php Options-API backed store
    Http/CallbackClient.php Signed completion callback delivery
  tests/                   PHPUnit tests
```
