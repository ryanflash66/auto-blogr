# AutoBlogr — Safety Rules

## Always require human approval
authentication · authorization / access control · payments · billing · secrets / credentials / **BYOK keys** · user data (PII: deletion, export, migration) · database migrations / schema (`supabase/migrations/**`) · infrastructure · deployment config (Vercel) · Supabase **Edge Functions** · major dependency upgrades · major architecture changes · public-API / contract changes · large diffs (beyond the agreed threshold) · low test coverage on the change · unclear / missing acceptance criteria · business-logic ambiguity.

In **Mode 3** these are excluded from autonomous **selection** (SELECT skips protected surfaces) and are never merged autonomously — they move only when a human advances them. The loop hands them back via labels (`owner-review` / `human-only` / `owner-input` / `blocked` / `Decision`) + a comment.

## Never do
- Bypass / disable / work around CI, required checks, or branch protection.
- Merge a PR with **red or missing** required checks.
- **Push or merge to `main` from the loop** (production promotion is a human step).
- Ignore / suppress failing tests (no skips, no `--no-verify`, no commenting-out to go green).
- Create fake or stubbed "integrations" that pretend to work.
- Add secrets / tokens / credentials to the repo or any file.
- Overwrite / destroy important existing files — always preserve or merge.
- Change production / deploy config without explicit approval.
- Add AI attribution / Co-Authored-By trailers (Ryan is the sole author).

## Risk heuristics
- **Low-risk** = small, well-tested, reversible, no protected areas, clear AC. → `ai-eligible`.
- **Risky** = large diff, touches protected paths, thin/no tests, ambiguous AC, hard to reverse. → hand back.
- When in doubt, treat as risky and leave it for a human.

## Demotion rule
A serious incident (a bad merge that breaks `dev` or ships broken behavior) can drop the project toward **Mode 1** (PR-only) until trust is re-earned — the owner's call. Routine red builds / corrections in Mode 3 do **not** auto-demote; they become tickets. Because production is human-promoted, a bad autonomous merge lands on **`dev`**, not production — the owner's testing on `dev` + new tickets is the feedback loop.
