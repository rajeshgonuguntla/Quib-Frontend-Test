---
name: create-pr
description: Opens a fully filled GitHub pull request for the current Cuib branch only after design-guardrails passes and `npm run check` exits 0. Use when the user asks to create, open, or file a PR, run gh pr create, or push and open a pull request.
---

# Create PR

Always use `gh`. Never update git config. Never force-push `main`/`master`. Never skip hooks. Do not merge unless the user asks.

Read and follow [../design-guardrails/SKILL.md](../design-guardrails/SKILL.md) **before** opening a PR. Then run `npm run check` and wait for exit 0. If either gate fails, or `npm run check` was not run in this attempt, stop. Do not push and do not `gh pr create`. A GitHub Actions run on the pull request does not count. The pass has to happen before the PR exists.

## Workflow

Copy and track:

```
PR progress:
- [ ] design-guardrails passed
- [ ] git status / diff / log vs base
- [ ] `npm run check` (lint, tsc, unit, component, integration, studio e2e)
- [ ] push -u if needed
- [ ] gh pr create with full template
- [ ] return PR URL
```

**1. Guardrails**

Run the design-guardrails skill on this branch’s diff. On failure: do not push for the sake of a PR, and do not `gh pr create`.

**2. Inspect** (parallel)

- `git status`
- `git diff` (staged and unstaged)
- `git log` and `git diff [base]...HEAD` (usually `origin/main`)
- Whether the branch tracks a remote and is up to date

Commit only if the user asked and there are committed-worthy changes. Do not commit `.env`, credentials, or secrets.

**3. Tests**

Run `npm run check`. That is the gate for every change:

- `npm run lint`
- `npx tsc --noEmit`
- `npm test` — unit, component, and integration tests under `src/**/*.test.{ts,tsx}`
- `npm run e2e` — `e2e/studio` on Chrome, Firefox, and Safari: end-to-end flows, screenshot baselines, accessibility, keyboard, reduced motion, and the 390px phone viewport

Do not skip `npm run e2e` because a change looks unrelated to Studio. Do not `--no-verify`. `npm run check` must exit 0 before step 4. A failure, a skip, or a result from an earlier session does not count. Stop. Do not push and do not `gh pr create`.

**4. Push**

If the branch has no upstream: `git push -u origin HEAD`. Do not force-push main/master. Warn if the user asks to force-push main.

**5. Open the PR**

Only start this step after `npm run check` has exited 0 in this attempt. Fill **every** section in [PR_TEMPLATE.md](PR_TEMPLATE.md). No empty `- ` bullets, no skipped headings, no “TBD”. The test-plan boxes for `npm test` and `npm run e2e` must say pass, with the command result. “Not run” or a failure means stop. Include branch, commits vs base, and a Files list (`path` — why). Title is **why**, matching commit voice (example: `Replace phone study chips with a left-side dot scrubber.`).

If any required section is blank, stop. That is a failed code check — do not `gh pr create`.

```bash
gh pr create --title "the pr title" --body "$(cat <<'EOF'
…template…
EOF
)"
```

On Windows PowerShell, pass the body via a here-string or a temp file; do not skip sections because of the shell.

**6. Return** the PR URL. Do not merge unless asked.

## Required PR fields

- Title
- Summary (1–3 user-facing bullets)
- What changed (areas/files, not a dump)
- Files (`path` — why for each)
- Test plan (desktop; phone &lt;768 if UI; empty/error if relevant; `npm run check` results, including studio e2e)
- Guardrails (`design-guardrails passed`, plus Blocks / Notes)
- Risk / rollout
- Screenshots **or** “not UI”

If the change is UI and there are no screenshots, say how it was verified (browser widths, what you clicked). Do not invent screenshots.
