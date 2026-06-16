# Gap Report: Upwork Proposal Claims vs. Actual Repo

**Repo:** `ryanflash66/auto-blogr`
**Date:** 2026-06-16
**Branch reviewed:** `claude/audit-upwork-claims-5fl0r5`
**Status:** Read-only audit. No files were edited. Awaiting per-claim decision.

---

## Repo Reality

This repo is a **pure client-side React 18 + Vite single-page app**. Data
persists in browser `localStorage` (`src/lib/storage.js`). WordPress
publishing happens directly from the browser by calling the WordPress REST
API. There is no server-side code anywhere in the tree:

- 0 `.php` files
- No `composer.json`, no `phpunit.xml`
- No `tests/` or `__tests__/` directory
- No `.github/` directory or CI configuration
- No JavaScript test runner in `package.json` (no Vitest/Jest/Cypress/Playwright)

---

## Claim 1 — Auth via WordPress Application Passwords + HMAC signing

**Label: PARTIAL**

### Application Passwords — Supported (as a client)

- `src/components/wordpress/SiteForm.jsx:76` instructs the user to create an
  Application Password (Users -> Profile -> Application Passwords).
- `src/services/wordpressSites.js:53-77` (`testConnection`) authenticates with
  HTTP Basic auth: `btoa(\`${site.username}:${site.api_key}\`)` against
  `/wp-json/wp/v2/users/me`.
- `src/components/posts/PublishModal.jsx` reuses the same Basic-auth header for
  media upload, term creation, and post creation.

This is the correct, standard way to consume WordPress Application Passwords.
It is genuine.

### HMAC signing — Absent

- A search for `hmac|crypto|signature|subtle|sign` across `src/` returns
  nothing. There is no request signing of any kind. The only auth is Basic auth.

**Caveat:** the api_key (application password) is stored in plaintext in
`localStorage` and sent as Basic auth. That is acceptable for a local-only tool
but it is not "HMAC signing."

---

## Claim 2 — Asynchronous post processing with real-time callbacks

**Label: ABSENT** (only a synchronous progress UI exists)

- The publish flow `PublishModal.handlePublish`
  (`src/components/posts/PublishModal.jsx`) is a sequence of `await fetch(...)`
  calls running in the browser, with local UI step state (`publishStep`:
  `uploading` -> `terms` -> `publishing` -> `success`).
- That is `async/await` in the JavaScript sense, but there is no background job
  queue, no worker, and no real-time callback mechanism. A search for
  `webhook|websocket|eventsource|sse|setInterval|polling|callback` finds only
  React `useCallback` UI hooks, nothing related to post processing.
- The "real-time" progress is just sequential fetches updating a spinner. No
  callbacks come back from any server.

---

## Claim 3 — PHPUnit coverage above 80 percent

**Label: ABSENT — coverage is not measurable because no test suite exists**

- No PHP files, no `phpunit.xml`, no `composer.json`, no `tests/` directory
  anywhere.
- I attempted to locate and run a PHPUnit suite. There is none to run, so no
  real percentage can be reported.
- For completeness: there are also zero JavaScript tests. Effective automated
  test coverage of this repo is **0 percent**.

---

## Claim 4 — CI/CD via GitHub Actions

**Label: ABSENT**

- No `.github/` directory, no `workflows/`, no `*.yml` CI config of any kind.
- `package.json` has `dev`, `build`, `lint`, `typecheck`, `preview` scripts but
  nothing wires them to CI.

---

## Summary

| #  | Claim                                  | Label     | Evidence |
|----|----------------------------------------|-----------|----------|
| 1a | WP Application Passwords                | Supported | `wordpressSites.js:53-77`, `PublishModal.jsx`, `SiteForm.jsx:76` |
| 1b | HMAC signing                           | Absent    | no crypto/hmac/signature in `src/` |
| 2  | Async processing + real-time callbacks | Absent    | sequential browser fetches only; no queue/webhook/ws/SSE |
| 3  | PHPUnit coverage > 80 percent          | Absent    | no PHP, no PHPUnit, no tests; real coverage 0 percent |
| 4  | CI/CD via GitHub Actions               | Absent    | no `.github/workflows` |

**Net:** Of the four proposal claims, only "uses WordPress Application
Passwords" is honestly backed by the current code. HMAC signing,
async/callbacks, PHPUnit 80 percent, and GitHub Actions are all absent. The
README currently makes none of these four claims, so right now the README does
not overstate. The risk is purely that a client clicks through expecting the
proposal's claims and finds a `localStorage` SPA.

---

## Decisions Needed (per claim)

- **Claim 1 (HMAC):** (a) implement real HMAC request signing with tests,
  (b) drop HMAC and keep only the Application Passwords claim, or (c) leave as-is.
- **Claim 2 (async + callbacks):** (a) build a real async processing path with
  callbacks (needs a backend or worker; significant new architecture),
  (b) reword to the honest "sequential publish with progress UI," or (c) drop it.
- **Claim 3 (PHPUnit 80 percent):** (a) build a real PHP/WordPress component to
  test, (b) add a real JS test suite (Vitest) and report its true measured
  coverage, or (c) drop the testing claim.
- **Claim 4 (GitHub Actions):** (a) add a real CI workflow (lint + typecheck +
  build, plus tests if added), or (b) drop the claim.

**Architecture note:** claims 1b, 2, and 3-as-PHP all presuppose a server-side
WordPress/PHP backend that does not exist here. This repo is entirely
front-end. Building them properly (no stubs) means either adding a real backend
or scoping the claims to what a front-end app can truthfully do.
