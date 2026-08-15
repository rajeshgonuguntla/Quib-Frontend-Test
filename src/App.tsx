import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './components/ThemeContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { GOOGLE_CLIENT_ID } from './config/google';
import { LandingPage } from './components/LandingPage';
import { SignIn } from './components/SignIn';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { MyQuizzes } from './components/MyQuizzes';
import { MyCertificates } from './components/MyCertificates';
import { QuizSetup } from './components/QuizSetup';
import { PlaylistSetup } from './components/PlaylistSetup';
import { QuizTaking } from './components/QuizTaking';
import { Results } from './components/Results';
import { Certificate } from './components/Certificate';
import { Verification } from './components/Verification';
import { Settings } from './components/Settings';
import { Upgrade, UpgradeSuccess } from './components/Upgrade';
import { LegalPage } from './components/LegalPage';
// Educators page kept in src/components/Educators.tsx for later; public route redirects to home for now.
import { EducatorStudio } from './components/EducatorStudio';
import { EducatorMyCourses } from './components/EducatorMyCourses';
import { EducatorAnalytics } from './components/EducatorAnalytics';
import { AdminInsights } from './components/AdminInsights';
import { CourseEditor } from './components/CourseEditor';
import { Governments } from './components/Governments';
import { EducatorProfile } from './components/EducatorProfile';
import { CourseBuilderFollowupsPage } from './components/CourseBuilderFollowupsPage';
import { CourseDetails } from './components/CourseDetails';
import { BrowseCourses } from './components/BrowseCourses';
import { Creators } from './components/Creators';
import { MyCourses } from './components/MyCourses';
import { ProtectedRoute, PublicOnlyRoute } from './auth';
import { AppShell } from './shell/AppShell';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <UserProfileProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/terms" element={<LegalPage kind="terms" />} />
              <Route path="/privacy" element={<LegalPage kind="privacy" />} />
              <Route element={<PublicOnlyRoute />}>
                <Route path="/signin" element={<SignIn />} />
              </Route>
              <Route path="/verify/:certId" element={<Verification />} />
              <Route path="/governments" element={<Governments />} />
              <Route path="/educators" element={<Navigate to="/" replace />} />
              <Route path="/educator-course-builder" element={<Navigate to="/educator-studio?tab=url" replace />} />
              <Route path="/course-details" element={<CourseDetails />} />
              <Route path="/course-details/:courseId" element={<CourseDetails />} />

              <Route element={<ProtectedRoute />}>
                {/* Full-bleed — no AppShell */}
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/quiz/:id" element={<QuizTaking />} />
                <Route path="/certificate/:id" element={<Certificate />} />

                {/* Authenticated app shell */}
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/browse-courses" element={<BrowseCourses />} />
                  <Route path="/creators" element={<Creators />} />
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/educator-studio" element={<EducatorStudio />} />
                  <Route path="/educator-courses" element={<EducatorMyCourses />} />
                  <Route path="/educator-analytics" element={<EducatorAnalytics />} />
                  <Route path="/admin/insights" element={<AdminInsights />} />
                  <Route path="/educator-courses/:courseId/edit" element={<CourseEditor />} />
                  <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/educator/:id" element={<EducatorProfile />} />
                  <Route path="/my-quizzes" element={<MyQuizzes />} />
                  <Route path="/certificates" element={<MyCertificates />} />
                  <Route path="/course-builder" element={<CourseBuilderFollowupsPage />} />
                  <Route path="/quiz-setup" element={<QuizSetup />} />
                  <Route path="/quiz-setup/:id" element={<QuizSetup />} />
                  <Route path="/playlist-setup/:id" element={<PlaylistSetup />} />
                  <Route path="/results/:id" element={<Results />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/upgrade/success" element={<UpgradeSuccess />} />
                </Route>
              </Route>
            </Routes>
          </UserProfileProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
