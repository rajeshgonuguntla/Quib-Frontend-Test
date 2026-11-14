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

## In-app Quiz ready (after generate)

`QuizReadyScreen` / `/quiz-setup/:id` — full-bleed (no sidebar). Light, dark, and phone (~390):

- Header: Cubit lockup left, **Back to dashboard** right.
- Desktop: title + pills + stats + section table on the left; sticky **Start quiz** card on the right (share URL, Copy link, Download offline HTML).
- Stats: questions / min / sections, hairline columns, no tinted chips.
- Sections table: title, subtitle, question count or `Essay · self-score`, minutes.
- Phone: pills as a text line; share block in flow; **Start quiz** sticky at the bottom, ~44px.
- Cubit orange primary. No neon green, no second palette.
- GRE = 54 questions / 118 min / 5 section rows (AWA self-score + verbal 12/15 + quant 12/15). SAT = 98 / 134 / 4. Custom uses the generated count (cap 60) and real API sections — never a fake 60/90/1 row because the model titled it GRE. Infer GRE/SAT from the prompt when the Custom chip is still selected.

## In-app quiz results

`ResultsScreen` / `/results/:id` — full-bleed (no sidebar). Light, dark, and phone (~390):

- Header: Cubit lockup left, **Back to dashboard** right.
- Left: `Results` kicker, **Your results**, large percent, `N of M correct`, Passed / Did not pass chip, exam meta, review copy, All / Wrong / Correct / Skipped filters, **one question at a time** (kicker + prompt + Incorrect/Correct + Explanation, Previous / Next).
- Right card: percent, section scores, jump-to-question grid (selected cell filled), **Retake quiz**, **Download report**. Clicking a number loads that question on the left.
- Phone: jump grid under the question (~44px cells); **Retake quiz** + **Download report** sticky at the bottom, ~44px.
- Incorrect uses `#ef4444`, not Cubit orange or neon green.

## Offline quiz HTML results

`buildQuizAttemptHtml` / Download report — the **same results layout** as [In-app quiz results](#in-app-quiz-results). Light, dark (`prefers-color-scheme`), and phone (~390px). One question at a time; jump-grid numbers load that question.

**HTML-only differences**
- Header right is **Open on Cubit**, not Back to dashboard.
- No **Download report** — the student already has the file.
- **Retake quiz** links to the Cubit quiz URL.

## Offline quiz HTML landing

Source of truth for **downloaded practice quiz HTML** (`src/utils/downloadQuizAttemptHtml.ts` intro / `#intro`): the **same exam overview** as [In-app Quiz ready](#in-app-quiz-ready-after-generate). Light, dark (`prefers-color-scheme`), and phone (~390px). Do not ship a second intro (centered marketing card, how-it-works list, pass-% stats).

**Same as in-app**
- Header lockup left; two-column desktop (title / pills / questions · min · sections / section table + sticky **Start quiz** card); phone pills as text, share in flow, sticky **Start quiz**.
- Cubit orange primary. No neon green, no second palette.

**HTML-only differences**
- Header right is **Open on Cubit** (links to `https://mycubit.app` or `/quiz/{id}`), not Back to dashboard.
- No **Download offline HTML** — the student already has the file.
- Share URL + Copy link still point at the Cubit quiz link.

**Do not**
- Cream/terracotta, purple gradients, neon, extra fonts.
- Numbered `01 / 02 / 03` how-it-works.
- Local score/results on this file after submit (submit goes to mycubit.app sign-in).
- Mix landing marketing tokens into this screen.

Taking UI after **Start quiz** (and in-app `/quiz/:id`) follows `QuizTaking.tsx` 1:1:

- Sticky header: Cubit lockup, title (desktop), **clock + mm:ss** (IBM Plex Mono, accent clock, warn under 5:00), **Submit quiz**.
- Timer: `defaultQuizTimeLimitSeconds` — 90s per question, 5 minutes minimum. Counts down; at 0, submit (app) or send to mycubit.app sign-in (HTML).
- One question at a time: type pill, option chips with ring, short-answer textarea, hairline progress + Previous / Next / Submit.

Standalone generated quizzes (app + HTML export) share this chrome. Course module quizzes in the lesson rail are a different surface.

## Tests and verification

- Pure helpers: unit tests (`vitest`) next to the file (`*.test.ts`).
- UI: exercise the changed flow in a browser at ~390px and desktop if both layouts exist. A single screenshot is not enough for interaction changes.
