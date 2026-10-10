# Web CI (P1)

`ops/github-ci.yml` is the workflow: typecheck, lint (non-blocking until P2 clears the 74 lint errors), build, `npm audit --omit=dev --audit-level=high`.

**Desk step (required):** the agent's GitHub OAuth token has no `workflow` scope, so it cannot push `.github/workflows/*`.
Copy `ops/github-ci.yml` → `.github/workflows/ci.yml` on main via the GitHub web UI (Add file → Create new file), or a `gh auth refresh -s workflow` session. Same pattern as legacyline-core.
