# Cubit visual and component rules

Dark (`.dark .cuib-app`): `--bg` `#050505`, `--surface` `#0d0d0d`, `--ink` `#f2f2f2`, `--border` `#1c1c1c`, `--fill` `#141414`, `--accent` / `--brand` `#ff7a1a`.

## Brand

- Product: **Cubit** (`BRAND_NAME`)
- Support: `support@cubit.ai`
- Domain: `cubit.ai`

User-facing UI says Cubit.

## Anti-slop

- No neon green (`#22c55e`) progress checklists or loading steps — use shell `--accent` / Cubit orange.
- Stacked “AI generating” step cards on load screens — prefer one % + one status line + a hairline progress track.

## Components

- Brand mark: `src/components/CubitLogo.tsx`
- Divider collapse: `.cuib-edge-toggle` + `--horizontal` / `--vertical` in `app-shell.css`. Chevron only (lucide `size={14}` `strokeWidth={2.2}`), **no circle border**. Keep a 44px transparent hit target. Use a tight `--bg` knockout behind the glyph so the divider does not show through the chevron. Sidebar rail and dashboard Continue learning must share this.
