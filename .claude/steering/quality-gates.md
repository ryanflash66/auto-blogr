# AutoBlogr — Quality Gates

## The quality gate
```
npm ci && npm run lint && npm run test && npm run build
```
- `npm run lint` — ESLint (`eslint .`).
- `npm run test` — Vitest (`vitest run`).
- `npm run build` — Vite production build.
- `npm run typecheck` — `tsc -p ./jsconfig.json` (available; run when touching typed logic. **Not** enforced by Web CI, so not part of the merge-gating command.)

## What "green" means
All steps above pass locally **and** the required CI check **"Lint and build"** (Web CI) passes on the PR. The runner treats the gate as **red** if `npm ci`, lint, test, or build returns non-zero — nothing is pushed on red.

## Reading CI
`gh pr checks <n>` or the Checks API. The auto-merge gate keys on the **"Lint and build"** check being `COMPLETED` + successful. Other checks (e.g. Copilot code review) are advisory and do **not** gate auto-merge.

## Rules
- **Never merge on red. Never weaken a test to go green.**
- Add/adjust tests for every behavior change; no test evidence ⇒ not ready.
- **Coverage:** no numeric floor on the web app yet. (`wp-plugin/` PHP suite enforces 80% via `ci.yml`.) Prefer adding tests with each change; if you want a web-app floor enforced, wire it into `web.yml` and mark it required.
