# Cubit visual and component rules

Do not invent a new look. Match the signed-in app.

## Tokens (`src/styles/app-shell.css`)

Light:

- `--bg` / `--surface`: `#ffffff`
- `--ink`: `#0a0a0a`
- `--ink-soft`: `#6e6e6e`
- `--ink-faint`: `#a3a3a3`
- `--border`: `#eaeaea`
- `--fill`: `#f5f5f5`
- `--accent` / `--brand`: `#e8650a`
- `--accent-soft`: `#fff1e6`

Dark (`.dark .cuib-app`): `--bg` `#050505`, `--surface` `#0d0d0d`, `--ink` `#f2f2f2`, `--border` `#1c1c1c`, `--fill` `#141414`, `--accent` / `--brand` `#ff7a1a`.

Type: `--display` / `--serif` Inter, `--mono` IBM Plex Mono.

Landing has its own tokens. Do not mix landing colors into the signed-in shell, or shell tokens into the marketing page, without an explicit ask.

## Brand copy (`src/brand.ts`)

- Product: **Cubit** (`BRAND_NAME`)
- Support: `support@cubit.ai`
- Domain: `cubit.ai`

User-facing UI says Cubit, not legacy Quib.

## Reuse these

- Shell: `src/shell/AppShell.tsx`, `AppTopbar.tsx`, `AppSidebar.tsx`, `src/styles/app-shell.css`
- Primitives: `src/components/ui/button.tsx`, `input.tsx`, `sheet.tsx`, `dialog.tsx`
- Theme: `src/components/ThemeContext.tsx` (`getC` on full-bleed lesson/quiz pages)
- Brand mark: `src/components/CubitLogo.tsx` (filename legacy; display Cubit)
- Divider collapse: `.cuib-edge-toggle` + `--horizontal` / `--vertical` in `app-shell.css`. Chevron only (lucide `size={14}` `strokeWidth={2.2}`), **no circle border**. Keep a 44px transparent hit target. Use a tight `--bg` knockout behind the glyph so the divider does not show through the chevron. Sidebar rail and dashboard Continue learning must share this.

Do not add a second Button/Card/Input system. Do not restyle the whole shell to ship a small feature.

## Phone

Breakpoint for this product’s lesson/shell splits: **768px** (`md`). Shell CSS still has a 980px cut in places; do not add a third number. Prefer aligning new work to 768.

Forbidden on phone:

- `onMouseEnter` as the only way to open a menu
- Title in a boxed control that looks like a select but does nothing
- Inputs under 16px (iOS zoom)
- Hit targets well under 44px for primary actions
- `100vh` + `overflow: hidden` that clips under the iOS URL bar (prefer `dvh` if locking a viewport)

Phone-only features use `md:hidden`. Leave `hidden md:flex` desktop rails alone.

## Anti-slop

Reject diffs that look like generic AI UI:

- Warm cream `#F4F1EA` + terracotta + decorative serif
- Near-black + acid green
- Neon / Tailwind green progress checklists (`#22c55e`, lime pills, glowing double-checks) — use shell `--accent` / `getC().red` for loading steps
- Stacked “AI generating” step cards on load screens — prefer one % + one status line + a hairline progress track
- Purple/violet SaaS gradients, glassmorphism, neon glow
- Numbered `01 / 02 / 03` markers unless the content is actually a sequence
- Extra fonts (Playfair, Space Grotesk, etc.) when Inter is already the product face
- “Unlock your potential”, “seamless experience”, emoji in product chrome

## Tests and verification

- Pure helpers: unit tests (`vitest`) next to the file (`*.test.ts`).
- UI: exercise the changed flow in a browser at ~390px and desktop if both layouts exist. A single screenshot is not enough for interaction changes.
