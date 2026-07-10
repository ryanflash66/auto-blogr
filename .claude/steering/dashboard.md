# AutoBlogr — Steering Dashboard

_Last `/steer`: **2026-07-10** · Mode 3 (max autonomy → `dev`)_

## Setup status
Onboarded ✅ (2026-07-10). Operating in **Mode 3**. The loop **idles until an `ai-eligible` Todo ticket exists** — by design, the current Phase D backlog is owner-gated (auth / secrets / edge functions), so it carries hand-back labels.

## Steering mode
**Mode 3 — auto-merge every `ai-eligible` PR to `dev` once "Lint and build" is green** → ticket Done. Never merges `main`; a human promotes `dev` → `main` (Vercel) for production.

## Scheduled dev loop
- Runner: `scripts/dev-loop-runner.ps1` (+ `scripts/prompts/select.txt|implement.txt|finalize.txt`).
- Task: **"AutoBlogr Dev Loop"** — **weekdays 09:30**, logged-on only. Cadence reasoning: small/quiet `ai-eligible` backlog, no deadline → size-based default (matches the owner's other loops).
- One ticket per run; throughput scales with cadence, not in-run batching.
- Last run / next run: see the onboarding readiness report (the run's `-NoPr` dry run + registration result).

## Linear
Connected ✅. Team **Dark7eaper** / project **AutoBlogr** (`DAR-###`). Statuses `Backlog → Todo → In Progress → In Review → Done`. Labels present: `ai-eligible` ✅ · `human-only` ✅ · `owner-review` ✅ · `owner-input` ✅ · `blocked` ✅ · `Decision` ✅. (`safe-auto-merge`: not used — Mode 3.)

## GitHub
`ryanflash66/auto-blogr` (public). Default `main`; loop base `dev`. Branch protection on `main` (require PR + "Lint and build") — configured during onboarding. PR template / CODEOWNERS: ❌ not added.

## CI/CD
- Web CI (`web.yml`): lint + build + test on PRs to main/dev → check **"Lint and build"** ✅.
- WordPress Plugin CI (`ci.yml`): PHPUnit, 80% coverage floor ✅.
- Copilot code review ✅ (advisory, does not gate auto-merge).
- Required check on `main`: **"Lint and build"**.

## Deployment
Vercel — inferred (Phase E, DAR-387). **Not yet wired** in the repo.

## Protected areas
Branch: `main`. Paths: `.env*` · secrets/BYOK · auth/authz · `supabase/migrations/**` · `src/lib/supabase*` · Edge Functions · `.github/workflows/*` · deploy config · `wp-plugin/**` · payments.

## Known gaps / unverified
- Vercel deploy not wired (DAR-387).
- Stale `autoblogr-web/` sub-app pending retire/integrate decision (DAR-388).
- No PR template / CODEOWNERS.
- Supabase Auth email confirmation **OFF** — re-enable before launch (DAR-387).
- ~2 throwaway test users (`abr-c1-*@gmail.com`) still in the DB — delete via dashboard.

## Next recommended action
Let the loop take its first weekday-09:30 run. To give it real work, move an `ai-eligible` ticket to **Todo** (e.g. **DAR-389** data-layer tests or **DAR-390** docs).
