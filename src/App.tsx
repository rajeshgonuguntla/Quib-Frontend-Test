import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider } from './components/ThemeContext';
import { LandingPage } from './components/LandingPage';
import { SignIn } from './components/SignIn';
import { Dashboard } from './components/Dashboard';
import { MyQuizzes } from './components/MyQuizzes';
import { MyCertificates } from './components/MyCertificates';
import { QuizSetup } from './components/QuizSetup';
import { QuizTaking } from './components/QuizTaking';
import { Results } from './components/Results';
import { Certificate } from './components/Certificate';
import { Verification } from './components/Verification';
import { Settings } from './components/Settings';
import { Educators } from './components/Educators';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-quizzes" element={<MyQuizzes />} />
          <Route path="/certificates" element={<MyCertificates />} />
          <Route path="/quiz-setup" element={<QuizSetup />} />
          <Route path="/quiz-setup/:id" element={<QuizSetup />} />
          <Route path="/quiz/:id" element={<QuizTaking />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/certificate/:id" element={<Certificate />} />
          <Route path="/verify/:certId" element={<Verification />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/educators" element={<Educators />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}