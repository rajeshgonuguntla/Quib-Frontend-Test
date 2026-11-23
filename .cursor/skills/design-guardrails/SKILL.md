---
name: design-guardrails
description: Fail-closed design and quality gate for Cubit UI so PRs do not ship generic, hover-only, or off-brand work. Use when changing layout, styling, copy, or components; before git push or opening a PR; or when the user mentions slop, quality bar, design review, or guardrails.
---

# Design guardrails

Read [CUIB.md](CUIB.md) before judging a diff. Source of truth is `src/styles/app-shell.css` and `src/brand.ts`, not `src/DESIGN_SYSTEM.md`.

## When to run

- Any user-visible UI, layout, copy, or component change
- Before `git push` or `gh pr create`
- When the user asks for a quality or design check

## Gate (fail closed)

1. Collect the change: `git status`, `git diff`, and `git diff [base]...HEAD` if on a branch.
2. Walk every item in the checklist below against the **diff**, not the whole repo.
3. If any **block** fails: list the issues, fix them or stop. Do **not** open a PR.
4. If all pass: say `design-guardrails passed` (one line plus any non-blocking notes).

## Checklist

**Brand**
- [ ] Uses existing tokens (`--ink`, `--bg`, `--accent` `#ff7a1a` dark / `#e8650a` light, `--border`, `--fill`, Inter / IBM Plex Mono). No second palette.
- [ ] No neon green (`#22c55e`) progress checklists — loading steps use `--accent` / Cubit orange.
- [ ] User-facing name is **Cubit**.

**Components**
- [ ] Reuses shell, `src/components/ui/*`, sheets, existing buttons. No parallel button/card/input kit.
- [ ] Divider collapse controls reuse `.cuib-edge-toggle` (`--horizontal` / `--vertical`): chevron only, no circled button; divider must not show through the glyph (`--bg` knockout).

**Phone (width &lt; 768)**
- [ ] No hover-only menus or truncated fake dropdowns.
- [ ] Inputs ≥16px on phone. Hit targets ~44px.
- [ ] Phone-only work does not restyle desktop `hidden md:flex` rails.

**Copy and motion**
- [ ] Sentence case, specific labels. No “Get started on your journey” filler.
- [ ] Motion is functional (state change), not decorative entrance spam. Honor `prefers-reduced-motion` if adding animation.

**Offline quiz HTML**
- [ ] If the diff builds or restyles exported quiz HTML (`downloadQuizAttemptHtml.ts`), the **landing / Quiz ready** screen matches [CUIB.md — Offline quiz HTML landing](CUIB.md#offline-quiz-html-landing). Do not invent a second intro.

**Scope**
- [ ] No drive-by refactors or unrelated files.
- [ ] No secrets (`.env`, credentials).
- [ ] New logic has tests.
- [ ] `npm run check` was run for this change. `npm test` covers unit, component, and integration tests. `npm run e2e` covers studio end-to-end flows, Chrome screenshot baselines, accessibility, and Chrome, Firefox, and Safari. A failure here is a block.
- [ ] A UI change that moves a baselined studio screen updates the matching file in `e2e/studio/**/*-snapshots` in the same change.
- [ ] User-visible UI was (or will be) checked in a browser, including a phone width if the change is mobile.

**PR write-up** (when opening or updating a PR)
- [ ] Body matches `.cursor/skills/create-pr/PR_TEMPLATE.md`: Summary, What changed, Files, Test plan, Guardrails, Risk / rollout, Screenshots.
- [ ] No empty `- ` bullets or skipped headings. Include branch, commits vs base, and the `npm run check` results (lint, tsc, unit/component/integration, studio e2e).

## Output

```
design-guardrails: passed | failed
Blocks:
- …
Notes:
- …
```

Empty Blocks when passed. Do not `gh pr create` on failed.
