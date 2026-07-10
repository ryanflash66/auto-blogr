# AutoBlogr — Review Rules

## Acceptance-criteria check
Map each Linear acceptance criterion to concrete evidence in the diff/tests. Every criterion must be satisfied **and shown**.

## Important findings (block → Changes Requested)
Correctness bugs · security issues · data-loss/corruption risks · broken acceptance criteria · missing/weak tests on changed behavior · risky changes to protected areas (auth, secrets/BYOK, migrations, Edge Functions, deploy config, `wp-plugin`) · public-API/contract breaks · performance cliffs.

## Nits (non-blocking)
Style, naming, minor structure, optional refactors. Label clearly as non-blocking; **never gate a PR on a nit alone.**

## Test-evidence check
Confirm tests exist for the changed behavior, they actually run, and the quality-gate result is shown. Root app gate: `npm run lint && npm run test && npm run build`. No evidence ⇒ request changes.

## CI check
Read the real status via `gh pr checks <n>` / the Checks API. The required check is **"Lint and build"** (Web CI, `.github/workflows/web.yml`). **Red or missing required check ⇒ not ready, never merge.**

## Risky-file detection (escalate)
Flag diffs touching `.env*` · secrets/BYOK keys · auth/authz · `supabase/migrations/**` · `src/lib/supabase*` · Supabase Edge Functions · `.github/workflows/*` · Vercel/deploy config · `wp-plugin/**` · payments/billing · lockfiles/major deps ⇒ escalate for human approval (`owner-review` / `human-only`).

## Request changes vs ready
- **Request changes** if: an Important finding is open, OR CI is red/missing, OR an AC is unmet, OR tests are missing.
- **Ready** if: all AC met + tests present + "Lint and build" green + only nits (if any).

## Escalate to human
Anything on the approval list, a large diff, low coverage on the change, ambiguous AC / business logic, or genuine uncertainty.

## Ready checklist (to reach Done via auto-merge)
- [ ] Every AC satisfied and shown
- [ ] Tests added/updated for changed behavior, passing
- [ ] Quality gate green locally
- [ ] Required check **"Lint and build"** green
- [ ] No protected-area touch (or explicit approval)
- [ ] Only nits remain
