# AutoBlogr — Agent Workflow

## Roles
- **PM / Triage:** select `ai-eligible`, unblocked, clear-AC **Todo** tickets that touch no protected surface; order by priority (Urgent > High > Medium > Low, then oldest); label unclear/risky ones `owner-review` / `human-only` / `Decision` and leave them.
- **Dev:** branch off `origin/dev`, implement one ticket in a worktree, run the quality gate, open a PR to `dev`.
- **Review:** apply [`review-rules.md`](review-rules.md); separate Important from Nit; request changes or approve.
- **QA:** once "Lint and build" is green, validate behavior against the AC; confirm or bounce.
- **Release (Mode 3):** auto-merge any `ai-eligible` PR to `dev` once **"Lint and build" is green** (squash + delete branch) → ticket **Done**. Red/missing check → leave open + In Review. **Never merge to `main`; never merge on red.** Production promotion `dev` → `main` (Vercel) is a human step.

## Linear status transitions
`Todo` → `In Progress` (implement starts) → `In Review` (PR opened) → `Done` (auto-merged to `dev` on green). Red build → comment + leave `In Progress`. This team's workflow has no separate `Changes Requested` / `Ready to Merge` / `In QA` states — those concepts map onto `In Progress` / `In Review`.

## Auto-merge eligibility (Mode 3)
Ticket `ai-eligible` + PR base `dev` + branch `dev-loop/dar-###-*` + required check **"Lint and build" green** + GitHub reports `MERGEABLE`. No `safe-auto-merge` label needed; protected surfaces are excluded at **SELECT**, not here. Never merge on red; never bypass protection; never touch `main`.

## Human escalation
Risky / unclear / blocked / failed / business-critical → label + comment in Linear; that item pauses autonomy until a human resolves it. **Escalation never halts the scheduled run** — the run labels, comments, and moves on.

## One scheduled run (the batch)
1. **Merge sweep** — land any open `dev-loop/*` PR to `dev` whose "Lint and build" is green (→ ticket Done). Conflicts/red left open.
2. **SELECT** (read-only) — list eligible **Todo** tickets in project AutoBlogr. Empty (the common case for the owner-gated Phase D backlog) → exit cleanly, no worktree.
3. **IMPLEMENT** — one ticket in a dedicated worktree off `origin/dev`.
4. **Quality gate** — `npm ci` + lint + test + build. Red → comment, leave In Progress, no PR.
5. **PR + FINALIZE** — green → push feature branch, open PR to `dev`, move ticket → In Review with the PR link.
6. **Exit** — the next scheduled run handles the rest. Never asks "keep going?".
