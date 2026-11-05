---
name: create-pr
description: Opens a fully filled GitHub pull request for the current Cuib branch after the design-guardrails gate passes. Use when the user asks to create, open, or file a PR, run gh pr create, or push and open a pull request.
---

# Create PR

Always use `gh`. Never update git config. Never force-push `main`/`master`. Never skip hooks. Do not merge unless the user asks.

Read and follow [../design-guardrails/SKILL.md](../design-guardrails/SKILL.md) **before** opening a PR. If the gate fails, stop.

## Workflow

Copy and track:

```
PR progress:
- [ ] design-guardrails passed
- [ ] git status / diff / log vs base
- [ ] tests
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

Run `npm test`. If UI-only and tests are unrelated, still run them. Do not `--no-verify`.

**4. Push**

If the branch has no upstream: `git push -u origin HEAD`. Do not force-push main/master. Warn if the user asks to force-push main.

**5. Open the PR**

Fill every section in [PR_TEMPLATE.md](PR_TEMPLATE.md). Title is **why**, matching commit voice (example: `Replace phone study chips with a left-side dot scrubber.`).

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
- Test plan (desktop; phone &lt;768 if UI; empty/error if relevant)
- Guardrails (`design-guardrails passed`)
- Risk / rollout
- Screenshots **or** “not UI”

If the change is UI and there are no screenshots, say how it was verified (browser widths, what you clicked). Do not invent screenshots.
