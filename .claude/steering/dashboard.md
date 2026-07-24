# AutoBlogr — Steering Dashboard

_Last `/steer`: **2026-07-15** · Mode 3 (max autonomy → `dev`)_

## Setup status
Onboarded ✅ (2026-07-10). Operating in **Mode 3**. The loop **idles until an `ai-eligible` Todo ticket exists** — by design, the current Phase D backlog is owner-gated (auth / secrets / edge functions), so it carries hand-back labels. **Backlog is currently 100% owner-gated: no `ai-eligible` + Todo ticket exists, so the loop has nothing to pick up.**

## Since last steer (2026-07-10 → 2026-07-15)
- **DAR-389** (Phase E2 — data-layer unit tests) implemented by the loop, merged to `dev` (#13), and **promoted to `main` via #14** → ticket **Done**.
- `dev` and `main` are **in sync** at `6344819` (no unpromoted work sitting on `dev`).
- No new tickets moved to Todo since; the Phase D/E backlog is unchanged and still owner-gated.

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
`ryanflash66/auto-blogr` (public). Default `main`; loop base `dev`. Branch protection on `main` (require PR + "Lint and build") — verified ✅ (`main` protected, `dev` unprotected). `dev` ≡ `main` at `6344819`. Open PRs: **0**. Merged to date: **14** (latest #14 — `dev` → `main` promotion). PR template / CODEOWNERS: ❌ not added.

## CI/CD
- Web CI (`web.yml`): lint + build + test on PRs to main/dev → check **"Lint and build"** ✅.
- WordPress Plugin CI (`ci.yml`): PHPUnit, 80% coverage floor ✅.
- Copilot code review ✅ (advisory, does not gate auto-merge).
- Required check on `main`: **"Lint and build"**.

## Deployment
Vercel — inferred (Phase E, DAR-387). **Not yet wired** in the repo (no Vercel config; no `supabase/functions/` dir → D3 Edge Function not started).

## Supabase
Project `zxyfdepyahwwerwvuazp` (`auto-blogr`, us-east-2, Postgres 17), Vercel-integrated org. **Status: `INACTIVE` (paused) ⚠️** — the live app/DB won't connect until it's restored. Security advisors: **clean** (no lints). Migrations in repo: `0001_init_schema`, `0002_harden_functions`.

## Protected areas
Branch: `main`. Paths: `.env*` · secrets/BYOK · auth/authz · `supabase/migrations/**` · `src/lib/supabase*` · Edge Functions · `.github/workflows/*` · deploy config · `wp-plugin/**` · payments.

## Known gaps / unverified
- **Supabase project is `INACTIVE` (paused)** — restore before anything hits the DB (⚠️ new since last steer).
- Vercel deploy not wired (DAR-387).
- Phase D not started (D1/D2/D3 all Todo; no Edge Function scaffolding yet).
- Stale `autoblogr-web/` sub-app **still present** — retire/integrate decision pending (DAR-388).
- No PR template / CODEOWNERS.
- Supabase Auth email confirmation **OFF** — re-enable before launch (DAR-387).
- ~2 throwaway test users (`abr-c1-*@gmail.com`) may still be in the DB — delete via dashboard (unverified while project paused).

## Next recommended action
The `ai-eligible` + Todo queue is **empty**, so the loop stays idle. To restart forward motion, the owner needs to unblock Phase D:
- Review **DAR-384 (D1 — serve OpenRouter key from profile)**; if the approach is sound, relabel `ai-eligible` + move to **Todo** (note: it touches BYOK/`src/lib/supabase*` protected surface, so it needs owner sign-off first).
- Pick the image provider for **DAR-385 (D2)**, then same relabel path.
- **DAR-386 (D3 — Edge Function)** and **DAR-387 (E1 — Vercel)** stay human/owner steps.
- **DAR-390 (E3 — docs)** is `ai-eligible` but gated on D1–D3 landing; leave in Backlog until then.
