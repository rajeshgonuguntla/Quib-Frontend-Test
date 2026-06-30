# Quib Frontend — Source Overview

**Last updated:** June 2026

Quib is an ed-tech web app: learners take AI-generated quizzes and structured courses from YouTube; educators connect a channel or paste URLs to generate and publish courses.

## Authentication

- **Google OAuth only** (no email/password)
- JWT stored in `localStorage` (`token`)
- Sign-in intent: `creator` vs `student` in `localStorage` (`quib_sign_in_intent`) — controls educator nav visibility
- `profile.role` from API (`learner`, `educator`, `admin`) — used for publish permissions

## Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | LandingPage | Public |
| `/signin` | SignIn | Public (redirect if signed in) |
| `/verify/:certId` | Verification | Public |
| `/course-details/:courseId` | CourseDetails | Public (player requires sign-in to enroll) |
| `/dashboard`, `/browse-courses`, `/my-courses`, … | AppShell pages | Protected |
| `/educator-studio`, `/educator-courses` | Educator flows | Protected + creator intent |
| `/quiz/:id`, `/onboarding`, `/certificate/:id` | Full-bleed flows | Protected |

Legacy `/educators` redirects to `/`. `/educator-course-builder` redirects to `/educator-studio?tab=url`.

## Major flows

### Learner
1. Sign in as **student** → onboarding (interests) → dashboard
2. Browse courses → open course → enroll → LearningMode (YouTube embed, lesson complete, module quizzes)
3. Or: paste video URL → quiz setup → take quiz → results → certificate (standalone quizzes)

### Educator
1. Sign in as **creator** → Educator Studio
2. Connect YouTube channel **or** paste playlist/video URL
3. Generate course → CourseDetails → publish
4. Edit in Course Editor; manage in Educator My Courses

## API integration

All data comes from `quiz-app-backend` via Axios (`src/api/*` and inline calls in page components). Dev uses Vite proxy; production uses `VITE_API_BASE_URL` or Cloud Run fallback in `main.tsx`.

**Fallback mock data** (only when API fails or returns empty): dashboard curated cards, onboarding interests, creator profile static data in `data/creators.ts`.

## Design

- **AppShell pages:** Tailwind 4 + CSS variables + `components/ui/*` (shadcn-style)
- **Course/quiz pages:** legacy inline theme via `ThemeContext.getC()`
- Brand red: `#E10600`

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for tokens (some sections describe older mock-first architecture).

## Tests

`auth.test.ts` — JWT expiry validation only. Run: `npm test`.

## Related docs

- [`../README.md`](../README.md) — dev setup
- [`../../docs/PHASE_3_FEASIBILITY.md`](../../docs/PHASE_3_FEASIBILITY.md) — upcoming features
- [`../../quiz-app-backend/docs/FRONTEND_TO_DATABASE_MAP.md`](../../quiz-app-backend/docs/FRONTEND_TO_DATABASE_MAP.md) — screen → API → DB map
