# Cubit landing design

Source of truth for the public landing: hero, Features panel, and Learn panel.

Code: `src/styles/landing.css`, `src/components/LandingPage.tsx`, `src/components/landing/LandingNav.tsx`, `src/components/landing/LandingSimpleBelow.tsx`.

Signed-in app chrome uses `src/styles/app-shell.css` and `src/brand.ts`. Do not restyle the landing with shell tokens, and do not paint the signed-in shell with landing tokens. The hero search input is the exception: it is `StudentMasterInput` inside `.cuib-app`, so it keeps the app input look on purpose.

`src/DESIGN_SYSTEM.md` is stale (legacy red). Do not use it for new landing work.

Product name in UI is **Cubit**.

## Layout

- The landing is one locked viewport: `.landing-page` is `height: 100dvh` with `overflow: hidden`. Do not add a scrolling marketing page under the hero.
- Fixed nav is `h-14` (`56px`), `z-[100]`, backdrop blur. Hero content starts below it (`.landing-hero-stack` `padding-top: 3.5rem`).
- Content width: nav and panels `max-w-6xl`. Hero copy `max-w-3xl`, centered. Search + Google stack `max-w-xl`.
- Page gutters: `px-5` / `md:px-8`.
- Features and Learn are full-screen overlays (`fixed inset-0`, `z-[90]`, `pt-14`), not extra routes. Escape and the close control dismiss them. Opening the same nav item again closes the panel.
- Panel body scrolls (`overflow-y-auto`). The hero behind it does not.

## Color

Set on `.landing-page`. Light mode is `.landing-page.light`.

| Token | Dark | Light |
| --- | --- | --- |
| `--landing-bg` | `#000000` | `#fafafa` |
| `--landing-fg` | `#ededed` | `#0a0a0a` |
| `--landing-muted` | `#888888` | `#525252` |
| `--landing-border` | `rgba(255,255,255,0.1)` | `rgba(0,0,0,0.12)` |
| `--landing-card` | `#0a0a0a` | `#ffffff` |

Wordmark on the hero is `#f5f5f5` in dark mode and `--landing-fg` in light mode. Nav chrome is `rgba(0,0,0,0.8)` dark / `rgba(255,255,255,0.8)` light.

Brand accent for progress, focus, and emphasis is Cubit orange: `#ff7a1a` (dark) / `#e8650a` (light), written as `var(--brand, #ff7a1a)` on landing cards. Do not introduce a second accent (no purple gradients, no acid green, no cream + terracotta).

The faint page grid uses `--landing-border` at `64px`. It is decorative and `pointer-events-none`.

### Learn preview washes

Only the top well of a Learn card gets a subject tint. The card body stays `--landing-card`. Washes are soft gradients (~20% color fading to transparent), plus a mono glyph at ~35% opacity.

| Subject | Wash | Glyph |
| --- | --- | --- |
| Code / Python | blue `rgba(59, 130, 246, 0.22)` | `>>>` |
| Math | brand orange via `color-mix` on `--brand` | `∫` |
| Science | green `rgba(34, 160, 107, 0.22)` | `◈` |
| Reading / exams | amber `rgba(180, 120, 50, 0.2)` | `Aa` |

Progress bars stay orange on a `--landing-border` track. Do not recolor the bar per subject.

Feature card previews stay neutral (`--landing-bg` / borders). Do not add subject washes there.

## Type

- UI: Inter (`--display`).
- Labels: IBM Plex Mono (`.landing-mono-label`): `0.6875rem`, weight 500, `letter-spacing: 0.08em`, uppercase, `--landing-muted`.
- Hero wordmark: Inter 600, `44px` / `54px` from `md`, tight tracking.
- Hero headline: Inter 600, `26px` / `32px` from `md`, `--landing-fg`.
- Hero supporting line: `text-base` / `md:text-lg`, `--landing-muted`, `max-w-xl`.
- Panel title: `text-3xl` / `md:text-4xl`, semibold, tight tracking.
- Card title: `text-sm` semibold. Card body: `text-sm`, relaxed, `--landing-muted`.
- Trust line under the hero: `text-sm`, `--landing-muted`.

Sentence case for buttons and headlines. Mono labels are the only uppercase chrome.

## Hero

Order, top to bottom, centered:

1. Mark (`72px`, `84px` from `md`) + wordmark **Cubit**
2. Headline: **Your Personal Tutor**
3. One supporting sentence about classroom help
4. `StudentMasterInput` (`.cuib-app`, transparent wrapper, `max-w-xl`, left-aligned inside the centered column)
5. Guests only: existing Google Sign-In button, centered, `mt-4`. Dark theme `filled_black`, light theme `outline`, `size="large"`, pill. Do not add a second sign-in button.
6. Trust: **Free to try. No credit card.**

Guest arrow on that input opens the same Google account chooser. Signed-in dashboard uses the same input component with `signedIn` defaulting to true; that arrow submits. Do not put the Google overlay on the dashboard.

Entrance motion is one fade/rise (`opacity` + `y`, ease `[0.25, 0.1, 0.25, 1]`). Do not add looping decoration on the hero.

## Nav

- Left: mark only, links home and closes any panel.
- Center: **Features**, **Learn**. Active item is `--landing-fg` weight 600; idle is `--landing-muted` weight 400. Hit target `min-h-11`. No pill behind the label.
- Right: theme toggle. Signed in: **Dashboard** (solid `--landing-fg` on `--landing-bg`, `rounded-md`, `text-sm` medium). Signed out: no Log in / Sign up while creator flow is off. Google sign-in lives in the hero.

## Panels (Features and Learn)

Shared frame:

- Eyebrow: `.landing-mono-label` (`Features` or `Learn`)
- Title, centered
- `mt-10` grid: 1 column, `sm:grid-cols-2`, `lg:grid-cols-4`, `gap-4`
- Card: `rounded-xl`, `border-[var(--landing-border)]`, `bg-[var(--landing-card)]`, `text-left`, `overflow-hidden`
- Preview well: `min-h-[120px]`, bottom border `--landing-border`
- Footer CTA: **Get started free**, `min-h-11`, `rounded-md`, `bg-[var(--landing-fg)]`, `text-[var(--landing-bg)]`, `text-sm` medium, `mt-10`. It closes the panel and goes to `/#ask` (the hero). Do not send this CTA to `/signin`.

Features previews are small product sketches (notes, calendar, question, papers) in landing neutrals. Learn previews are topic + progress + subject wash.

## Do not

- Scroll the hero or stack more marketing sections under it.
- Mix `--ink` / `--bg` / `--accent` into panel cards, or `--landing-*` into the signed-in shell.
- Add a second button system, extra fonts, or a new accent color.
- Recolor Learn progress bars away from brand orange.
- Put subject washes on Feature cards or on the card body under a Learn preview.
- Add hover-only menus. Primary controls stay at least ~44px tall (`min-h-11` or the existing input hit target).
