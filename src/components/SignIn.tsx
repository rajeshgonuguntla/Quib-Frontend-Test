import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Award, Mail, Lock, Chrome } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import GoogleLoginButton from './GoogleLoginButton';
import { GoogleOAuthProvider } from '@react-oauth/google';


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
            Join thousands of learners testing their knowledge from YouTube content
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
            {/* Quib Cube Logo */}
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <svg viewBox="250 250 300 300" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <defs>
                  <linearGradient id="siTopG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#d0d0d0" /><stop offset="100%" stopColor="#b0b0b0" /></linearGradient>
                  <linearGradient id="siLeftG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#909090" /><stop offset="100%" stopColor="#707070" /></linearGradient>
                  <linearGradient id="siRightG" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a0a0a0" /><stop offset="100%" stopColor="#808080" /></linearGradient>
                  <linearGradient id="siBTop" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#ff4d4d" /><stop offset="100%" stopColor="#ff2d2d" /></linearGradient>
                  <linearGradient id="siBLeft" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#cc0000" /><stop offset="100%" stopColor="#990000" /></linearGradient>
                  <linearGradient id="siBRight" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#ff1a1a" /><stop offset="100%" stopColor="#cc0000" /></linearGradient>
                </defs>
                <g opacity="0.5">
                  <g transform="translate(310,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                  <g transform="translate(390,270)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                </g>
                <g opacity="0.7">
                  <g transform="translate(270,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                  <g transform="translate(350,295)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                  <g transform="translate(430,320)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                </g>
                <g>
                  <g transform="translate(310,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="120,30 120,80 50,105 50,55" fill="url(#siRightG)" /></g>
                  <g transform="translate(350,345)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siBTop)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siBLeft)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siBRight)" /><polygon points="0,30 50,5 100,30 50,55" fill="#fff" opacity="0.2" /></g>
                  <g transform="translate(390,370)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                  <g transform="translate(350,395)"><polygon points="0,30 50,5 100,30 50,55" fill="url(#siTopG)" /><polygon points="0,30 0,80 50,105 50,55" fill="url(#siLeftG)" /><polygon points="100,30 100,80 50,105 50,55" fill="url(#siRightG)" /></g>
                </g>
                <circle cx="400" cy="400" r="100" fill="#ff2d2d" opacity="0.06" />
              </svg>
              <span className="text-2xl font-[700] text-gray-900" style={{ fontFamily: "var(--display)" }}>Quib</span>
            </div>
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
            <GoogleOAuthProvider clientId="944587700647-v4d2dqg9io3q3qbgjoif32g21bcifg9s.apps.googleusercontent.com">
            <GoogleLoginButton />
        </GoogleOAuthProvider>

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