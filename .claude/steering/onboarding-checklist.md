# AutoBlogr — Onboarding Checklist (external setup)

Items are marked done only with proof. Anything left `[ ]` is genuinely not done — see the readiness report.

## Linear
- [x] Team / project: **Dark7eaper / AutoBlogr** (created 2026-07-10).
- [x] Workflow statuses (`Backlog → Todo → In Progress → In Review → Done`) — pre-existing.
- [x] Labels present: `ai-eligible`, `human-only`, `owner-review`, `owner-input`, `blocked`, `Decision`.
- [x] Phase D/E backlog seeded: DAR-384 … DAR-390.
- [ ] (Optional) Connect GitHub ↔ Linear sync.

## GitHub
- [x] `dev` branch created off `main` (loop base) and pushed.
- [x] Branch protection on `main`: require a PR + required status check **"Lint and build"**.
- [x] Web CI runs on all PRs to `main`/`dev` (required check always present).
- [ ] PR template + CODEOWNERS (not added).

## CI/CD
- [x] Web CI (lint + build + test) → check **"Lint and build"**.
- [x] WordPress Plugin CI (PHPUnit, 80% floor).
- [x] "Lint and build" marked **required** in `main` protection.

## Deployment
- [ ] Vercel project + env wiring (DAR-387). Keep production-config changes behind approval.
- [ ] Re-enable Supabase Auth email confirmation before launch (DAR-387).

## Claude Code
- [x] Linear MCP + `gh` authenticated.
- [x] `.claude/steering/` + `scripts/dev-loop-runner.ps1` + prompts committed.
- [x] `.claude/settings.local.json` → `permissions.defaultMode: bypassPermissions` (interactive runs are prompt-free).
- [x] Scheduled task **"AutoBlogr Dev Loop"** registered + enabled (logged-on only), weekdays 09:30, passing `-PermissionMode bypassPermissions`.
- [x] `-NoPr` dry run passed.

## Approval gates
- [x] Release owner: **Ryan** (sole author; promotes `dev` → `main`).
- [x] Protected-paths list confirmed (see `safety-rules.md`).
- [ ] Decide whether to enforce a diff-size / coverage threshold (none enforced on the web app yet).

_Boxes for GitHub / task steps reflect this onboarding run; the readiness report states the actual command results._
