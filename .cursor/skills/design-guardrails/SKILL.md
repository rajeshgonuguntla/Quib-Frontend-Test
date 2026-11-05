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
- [ ] User-facing name is **Cubit**.

**Components**
- [ ] Reuses shell, `src/components/ui/*`, sheets, existing buttons. No parallel button/card/input kit.

**Phone (width &lt; 768)**
- [ ] No hover-only menus or truncated fake dropdowns.
- [ ] Inputs ≥16px on phone. Hit targets ~44px.
- [ ] Phone-only work does not restyle desktop `hidden md:flex` rails.

**Copy and motion**
- [ ] Sentence case, specific labels. No “Get started on your journey” filler.
- [ ] Motion is functional (state change), not decorative entrance spam. Honor `prefers-reduced-motion` if adding animation.

**Scope**
- [ ] No drive-by refactors or unrelated files.
- [ ] No secrets (`.env`, credentials).
- [ ] New logic has tests.
- [ ] User-visible UI was (or will be) checked in a browser, including a phone width if the change is mobile.

## Output

```
design-guardrails: passed | failed
Blocks:
- …
Notes:
- …
```

Empty Blocks when passed. Do not `gh pr create` on failed.
