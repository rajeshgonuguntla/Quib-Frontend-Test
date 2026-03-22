import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Award, Mail, Lock, Chrome } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    // Mock authentication
    const returnTo = location.state?.returnTo || '/dashboard';
    navigate(returnTo, { state: location.state });
  };

  const handleGoogleAuth = () => {
    // Mock Google auth
    const returnTo = location.state?.returnTo || '/dashboard';
    navigate(returnTo, { state: location.state });
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "var(--display)" }}>
      {/* Left Side - Brand Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#E10600] via-red-700 to-red-900 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1763652387673-71b75ee71a24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhYnN0cmFjdCUyMGdyYWRpZW50JTIwcGF0dGVybnxlbnwxfHx8fDE3NzEyOTUxNzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-md text-white">
          <div className="flex items-center gap-3 mb-12">
            <span className="text-4xl font-[700]" style={{ fontFamily: "var(--display)" }}>Quib</span>
          </div>
          <h2 className="text-4xl font-[400] mb-6" style={{ fontFamily: "var(--serif)", letterSpacing: '-0.01em', lineHeight: 1.1 }}>Transform your YouTube learning</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of learners earning verified credentials from YouTube content
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold mb-1">AI-Generated Quizzes</div>
                <div className="text-white/80 text-sm">Custom assessments from any YouTube video</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold mb-1">Verified Certificates</div>
                <div className="text-white/80 text-sm">Professional credentials with verification IDs</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="font-semibold mb-1">LinkedIn Integration</div>
                <div className="text-white/80 text-sm">Share your achievements instantly</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-[400] text-gray-900 mb-2" style={{ fontFamily: "var(--serif)", letterSpacing: '-0.01em' }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start earning verified credentials today' 
                : 'Sign in to continue your learning journey'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <Button 
              variant="secondary" 
              className="w-full justify-center"
              onClick={handleGoogleAuth}
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </Button>
          </div>

          <div className="space-y-4 mb-6">
            

            

            {!isSignUp && (
              null
            )}
          </div>

          

          

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By continuing, you agree to Quib's Terms of Service and Privacy Policy. 
              Your certificates are stored securely and your learning data is private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}