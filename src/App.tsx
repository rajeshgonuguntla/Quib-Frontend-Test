import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider } from './components/ThemeContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { LandingPage } from './components/LandingPage';
import { SignIn } from './components/SignIn';
import { HomeFeed } from './components/HomeFeed';
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
import { Educators } from './components/Educators';
import { EducatorCourseBuilder } from './components/EducatorCourseBuilder';
import { EducatorProfile } from './components/EducatorProfile';
import { CourseDetails } from './components/CourseDetails';
import { ProtectedRoute, PublicOnlyRoute } from './auth';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <UserProfileProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/signin" element={<SignIn />} />
          </Route>
          <Route path="/verify/:certId" element={<Verification />} />
          <Route path="/educators" element={<Educators />} />
          <Route path="/educator-course-builder" element={<EducatorCourseBuilder />} />
          <Route path="/course-details" element={<CourseDetails />} />
          <Route path="/course-details/:courseId" element={<CourseDetails />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/educator/:id" element={<EducatorProfile />} />
            <Route path="/my-quizzes" element={<MyQuizzes />} />
            <Route path="/certificates" element={<MyCertificates />} />
            <Route path="/quiz-setup" element={<QuizSetup />} />
            <Route path="/quiz-setup/:id" element={<QuizSetup />} />
            <Route path="/playlist-setup/:id" element={<PlaylistSetup />} />
            <Route path="/quiz/:id" element={<QuizTaking />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/certificate/:id" element={<Certificate />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/educators" element={<Educators />} />
          </Route>
        </Routes>
        </UserProfileProvider>
      </Router>
    </ThemeProvider>
  );
}