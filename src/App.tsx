import { Component, lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './components/ThemeContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { GOOGLE_CLIENT_ID } from './config/google';
import { LandingPage } from './components/LandingPage';
import { SignIn } from './components/SignIn';
import { LegalPage } from './components/LegalPage';
import { isTokenValid, ProtectedRoute, PublicOnlyRoute } from './auth';
import { STUDIO_V2_ENABLED } from './config/features';
import { educatorRoutes } from './educator/routes';
import { INTERESTS_KEY } from './utils/onboardingStorage';

function lazyNamed<M extends Record<string, unknown>>(
  loader: () => Promise<M>,
  name: keyof M,
) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[name] as ComponentType };
  });
}

const Dashboard = lazyNamed(() => import('./components/Dashboard'), 'Dashboard');
const Onboarding = lazyNamed(() => import('./components/Onboarding'), 'Onboarding');
const Library = lazyNamed(() => import('./components/Library'), 'Library');
const MyCourses = lazyNamed(() => import('./components/MyCourses'), 'MyCourses');
const PracticePage = lazyNamed(() => import('./components/PracticePage'), 'PracticePage');
const NotesPage = lazyNamed(() => import('./components/NotesPage'), 'NotesPage');
const ReviewPage = lazyNamed(() => import('./components/ReviewPage'), 'ReviewPage');
const MyCertificates = lazyNamed(() => import('./components/MyCertificates'), 'MyCertificates');
const QuizSetup = lazyNamed(() => import('./components/QuizSetup'), 'QuizSetup');
const PlaylistSetup = lazyNamed(() => import('./components/PlaylistSetup'), 'PlaylistSetup');
const QuizTaking = lazyNamed(() => import('./components/QuizTaking'), 'QuizTaking');
const Results = lazyNamed(() => import('./components/Results'), 'Results');
const Certificate = lazyNamed(() => import('./components/Certificate'), 'Certificate');
const Verification = lazyNamed(() => import('./components/Verification'), 'Verification');
const Settings = lazyNamed(() => import('./components/Settings'), 'Settings');
const Upgrade = lazyNamed(() => import('./components/Upgrade'), 'Upgrade');
const UpgradeSuccess = lazyNamed(() => import('./components/Upgrade'), 'UpgradeSuccess');
const EducatorStudio = lazyNamed(() => import('./components/EducatorStudio'), 'EducatorStudio');
const EducatorMyCourses = lazyNamed(() => import('./components/EducatorMyCourses'), 'EducatorMyCourses');
const EducatorAnalytics = lazyNamed(() => import('./components/EducatorAnalytics'), 'EducatorAnalytics');
const AdminInsights = lazyNamed(() => import('./components/AdminInsights'), 'AdminInsights');
const CourseEditor = lazyNamed(() => import('./components/CourseEditor'), 'CourseEditor');
const Governments = lazyNamed(() => import('./components/Governments'), 'Governments');
const EducatorProfile = lazyNamed(() => import('./components/EducatorProfile'), 'EducatorProfile');
const CourseBuilderFollowupsPage = lazyNamed(
  () => import('./components/CourseBuilderFollowupsPage'),
  'CourseBuilderFollowupsPage',
);
const CourseDetails = lazyNamed(() => import('./components/CourseDetails'), 'CourseDetails');
const Discover = lazyNamed(() => import('./components/Discover'), 'Discover');
const BrowseCoursesRedirect = lazyNamed(() => import('./components/Discover'), 'BrowseCoursesRedirect');
const CreatorsRedirect = lazyNamed(() => import('./components/Discover'), 'CreatorsRedirect');
const AppShell = lazyNamed(() => import('./shell/AppShell'), 'AppShell');

class RouteErrorBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null };

  static getDerivedStateFromError(err: Error) {
    return { message: err?.message || 'Something went wrong.' };
  }

  render() {
    if (this.state.message) {
      return (
        <div style={{ minHeight: '100vh', background: '#060608', color: '#f2f2f0', padding: 40, fontFamily: 'system-ui' }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>This page failed to load.</p>
          <p style={{ color: '#8a8a8a', marginBottom: 24 }}>{this.state.message}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: '#ff7a1a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RouteFallback() {
  return (
    <div
      className="cuib-app flex min-h-dvh items-center justify-center"
      aria-busy="true"
      aria-label="Loading"
    >
      <div
        className="h-0.5 w-24 overflow-hidden rounded-full"
        style={{ background: 'var(--border)' }}
      >
        <div className="h-full w-1/2 rounded-full" style={{ background: 'var(--accent)' }} />
      </div>
    </div>
  );
}

function GuestHome() {
  if (!isTokenValid()) {
    return <LandingPage />;
  }
  const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
  return <Navigate to={hasInterests ? '/dashboard' : '/onboarding'} replace />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <UserProfileProvider>
            <RouteErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<GuestHome />} />
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route element={<PublicOnlyRoute />}>
                <Route path="/signin" element={<SignIn />} />
              </Route>
              <Route path="/verify/:certId" element={<Verification />} />
              <Route path="/governments" element={<Governments />} />
              <Route path="/educators" element={<Navigate to="/" replace />} />
              <Route
                path="/educator-course-builder"
                element={<Navigate to={STUDIO_V2_ENABLED ? '/educator-studio' : '/educator-studio?tab=url'} replace />}
              />
              <Route path="/course-details" element={<CourseDetails />} />
              <Route path="/course-details/:courseId" element={<CourseDetails />} />

              <Route element={<ProtectedRoute />}>
                {/* Full-bleed — no AppShell */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/quiz/:id" element={<QuizTaking />} />
                <Route path="/quiz-setup" element={<QuizSetup />} />
                <Route path="/quiz-setup/:id" element={<QuizSetup />} />
                <Route path="/results/:id" element={<Results />} />
                <Route path="/certificate/:id" element={<Certificate />} />

                {/* Authenticated app shell */}
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/browse-courses" element={<BrowseCoursesRedirect />} />
                  <Route path="/creators" element={<CreatorsRedirect />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/practice" element={<PracticePage />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  {STUDIO_V2_ENABLED ? (
                    educatorRoutes()
                  ) : (
                    <>
                      <Route path="/educator-studio" element={<EducatorStudio />} />
                      <Route path="/educator-courses" element={<EducatorMyCourses />} />
                      <Route path="/educator-analytics" element={<EducatorAnalytics />} />
                      <Route path="/educator-courses/:courseId/edit" element={<CourseEditor />} />
                    </>
                  )}
                  <Route path="/admin/insights" element={<AdminInsights />} />
                  <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/educator/:id" element={<EducatorProfile />} />
                  <Route path="/my-quizzes" element={<Navigate to="/library?tab=saved" replace />} />
                  <Route path="/certificates" element={<MyCertificates />} />
                  <Route path="/course-builder" element={<CourseBuilderFollowupsPage />} />
                  <Route path="/playlist-setup/:id" element={<PlaylistSetup />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/upgrade/success" element={<UpgradeSuccess />} />
                </Route>
              </Route>
            </Routes>
            </Suspense>
            </RouteErrorBoundary>
          </UserProfileProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
