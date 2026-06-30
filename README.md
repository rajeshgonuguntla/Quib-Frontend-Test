# Quib Frontend

React + Vite SPA for **Quib** — turn YouTube content into AI-generated quizzes and structured courses.

**Backend:** `../quiz-app-backend`  
**Phase 3 planning:** `../docs/PHASE_3_FEASIBILITY.md`

## Quick start

```powershell
cd Quib-Frontend-Test
npm install
npm run dev
```

Dev server: `http://localhost:5173` — proxies `/api` to `http://localhost:8451` when `VITE_API_BASE_URL` is unset.

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth (sign-in + YouTube connect) |
| `VITE_API_BASE_URL` | Optional; leave empty in dev to use Vite proxy |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint on `src/` |
| `npm test` | Vitest unit tests |

## App structure

| Area | Path | Notes |
|------|------|-------|
| Routes | `src/App.tsx` | Public landing, auth, course player; AppShell for signed-in app |
| Auth | `src/auth.tsx` | JWT in localStorage, route guards |
| API clients | `src/api/` | catalog, course, educator, quiz, user |
| Shell | `src/shell/` | Sidebar, topbar, nav config |
| Educator | `EducatorStudio`, `CourseEditor`, `EducatorMyCourses` | YouTube connect, generate, edit, publish |
| Learner | `BrowseCourses`, `MyCourses`, `CourseDetails` | Catalog, enroll, learning mode |

See [`src/README.md`](src/README.md) for page-level detail.

## Deploy

Multi-stage Docker build → nginx SPA on port 8080. Pass `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` as build args.
