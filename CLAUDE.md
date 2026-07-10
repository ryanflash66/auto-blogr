<!-- steering:begin -->
# AutoBlogr — AI steering

**What this is:** AutoBlogr is being converted from a single-user localStorage tool into a hosted, multi-user **Supabase** SaaS (Auth + DB + Storage + Edge Functions) with **bring-your-own-key** AI (each user stores their own OpenRouter + image-provider key in their `profiles` row). Root app: **React 18 + Vite 6**, JS with typecheck (`jsconfig.json`), Tailwind + shadcn/ui, `@supabase/supabase-js`, TanStack Query, Vitest. Also in the repo: `wp-plugin/` (PHP WordPress plugin, own PHPUnit CI) and a **stale** `autoblogr-web/` sub-app (see DAR-388).

## Four sources of truth
1. **Linear** is the source of truth for work — team **Dark7eaper**, project **AutoBlogr** (keys `DAR-###`).
2. **GitHub PRs** (`ryanflash66/auto-blogr`) are the source of truth for implementation evidence.
3. **CI + branch protection** are the hard merge gates — never bypassed.
4. **Claude** acts as PM / dev / reviewer / QA within the rules below; **Ryan is the release owner**.

## Steering mode — Mode 3 (max autonomy → `dev`)
The scheduled dev loop builds every `ai-eligible`, unblocked **Todo** ticket end-to-end and **auto-merges its PR to `dev` as soon as the required CI check is green**, then moves the ticket to Done. **It never touches `main`.** Production promotion **`dev` → `main` (Vercel) stays a human step.** A PR with red/missing checks is left open + *In Review*; `human-only` tickets are skipped. Never merge on red.

## Scheduled dev-agent routine
- Runner: [`scripts/dev-loop-runner.ps1`](scripts/dev-loop-runner.ps1) (+ `scripts/prompts/`), driven by the Windows Scheduled Task **"AutoBlogr Dev Loop"**.
- Cadence: **weekdays 09:30** (size/quiet backlog default). One ticket per run; throughput scales with cadence.
- Works the backlog hands-free — **never pauses between tickets**. SELECT (read-only) → IMPLEMENT (worktree) → quality gate → PR → auto-merge-on-green sweep.

## Quality gate ("green")
```
npm ci && npm run lint && npm run test && npm run build
```
Mirrors Web CI (`.github/workflows/web.yml`, check **"Lint and build"**). **Never merge on red; never weaken a test to go green.**

## Linear workflow & labels
- Statuses: `Backlog → Todo → In Progress → In Review → Done` (+ Canceled / Duplicate). The loop selects **Todo only**.
- **`ai-eligible`** — the loop may take it. Hand-back labels (loop skips): **`human-only`**, **`owner-review`**, **`owner-input`**, **`blocked`**, **`Decision`**. (No `safe-auto-merge` — Mode 3 doesn't use one.)

## Protected — require care / approval
Protected branch: **`main`** (protected; human promotes `dev` → `main`). Protected paths (never autonomously merged; excluded by SELECT):
`.env*` · secrets / **BYOK keys** · authentication & authorization · `supabase/migrations/**` & schema · `src/lib/supabase*` (client/auth/storage) · Supabase **Edge Functions** · `.github/workflows/*` · deploy config (Vercel) · `wp-plugin/**` · payments/billing.

Always require approval: auth, authz, payments, billing, secrets/keys, user PII, DB migrations, infra, deploy config, major dep upgrades, major architecture, public-API/contract changes, oversized diffs, low-coverage changes, unclear acceptance criteria.

## Never do
Bypass CI / required checks / branch protection · merge on red · push or merge to `main` from the loop · skip/suppress failing tests · commit secrets · add AI attribution / Co-Authored-By (Ryan is sole author) · overwrite important files without merging · change production/deploy config without approval.

**Full rules:** [`.claude/steering/`](.claude/steering/). Re-run `/steer` to refresh.
<!-- steering:end -->
