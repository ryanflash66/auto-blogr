# AutoBlogr — Project Instructions (operating contract)

## Project summary
AI-powered blog content generator with WordPress publishing, being converted from a single-user localStorage app into a hosted, multi-user **Supabase** SaaS. **Bring-your-own-key** AI: each user stores their own OpenRouter + image-provider key in their `profiles` row.

## Stack
- **Root app** (the SaaS target): React 18 + Vite 6, JavaScript with typecheck (`jsconfig.json` + `tsc`), Tailwind + shadcn/ui, `@supabase/supabase-js`, TanStack Query, react-hook-form + zod, Vitest. Package manager: **npm**.
- `wp-plugin/`: PHP WordPress plugin (PHPUnit, own CI, 80% coverage floor).
- `autoblogr-web/`: **stale** older sub-app (Vite 4 + Clerk) — retire/integrate decision pending (DAR-388).
- Services: Supabase (project ref `zxyfdepyahwwerwvuazp`), Vercel (deploy target, Phase E).

## Core commands (root app)
| Purpose | Command |
| --- | --- |
| Install | `npm ci` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Test | `npm run test` |
| Build | `npm run build` |
| **Quality gate** | `npm ci && npm run lint && npm run test && npm run build` |

## Linear workflow
- Team **Dark7eaper**, project **AutoBlogr**, ticket keys **`DAR-###`**.
- Statuses: `Backlog → Todo → In Progress → In Review → Done` (+ Canceled / Duplicate). The loop selects **Todo only**.
- Labels: **`ai-eligible`** (loop may take it). Hand-back (loop skips): **`human-only`**, **`owner-review`**, **`owner-input`**, **`blocked`**, **`Decision`**.

## Branch naming
- Loop branches: `dev-loop/<dar-###>-<timestamp>`, base **`dev`**.
- Manual work: `<type>/DAR-###-<slug>`, type ∈ {feat, fix, chore, refactor, docs, test}. Always include the DAR id.

## PR requirements
Link the Linear ticket; state what & why; acceptance-criteria checklist; test evidence (quality-gate command + result); note risk + protected-area touches; quality gate green; required check **"Lint and build"** green before merge. **Base `dev`, never `main`.**

## Definition of done
AC met · tests added/updated + passing · quality gate green · CI "Lint and build" green · reviewed · QA-validated · ticket → Done · docs updated if behavior changed. **Production ships only after a human promotes `dev` → `main` (Vercel).**

## Protected areas
- Protected branch: **`main`** (require PR + "Lint and build"; human promotes `dev` → `main`).
- Protected paths (require approval; excluded from autonomous work): `.env*` · secrets / **BYOK keys** · authentication & authorization · `supabase/migrations/**` + schema · `src/lib/supabase*` (client/auth/storage) · Supabase **Edge Functions** · `.github/workflows/*` · deploy config (Vercel) · `wp-plugin/**` · payments/billing.

## Claude permissions (Mode 3 → dev)
- **Autonomous:** select `ai-eligible` Todo tickets → branch → implement in a worktree → run the quality gate → open PRs to `dev` → auto-merge to `dev` on green CI → move tickets.
- **Needs approval / human:** anything touching a protected path, the `main` promotion, production/deploy config, or a `human-only`/`owner-*`/`Decision` ticket.

## Escalation
Blocked / risky / unclear / failed / business-critical → label in Linear (`blocked`, `owner-review`, `human-only`, or `Decision`) + a comment stating the risk and the decision needed; leave the ticket for a human. **Never pause the scheduled run waiting for a reply.** A good escalation names the ticket, the specific blocker, what was tried, and the exact decision required.

## Human approval rules
See [`safety-rules.md`](safety-rules.md) for the full always-require-approval + never-do lists.
