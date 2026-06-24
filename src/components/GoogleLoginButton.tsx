import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { fetchOnboarding } from '../api/catalogApi';
import { INTERESTS_KEY, EDUCATORS_KEY } from './Onboarding';
import {
  CREATOR_HOME_PATH,
  isEducatorRoute,
  setSignInIntent,
  type SignInIntent,
} from '../utils/signInIntent';

type GoogleLoginButtonProps = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string | number;
  signInIntent?: 'creator' | 'student';
};

function GoogleLoginButton({ theme = 'outline', size = 'large', width, signInIntent }: GoogleLoginButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useUserProfile();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setSignInError('Login failed — missing Google credential.');
      return;
    }

    setIsSigningIn(true);
    setSignInError(null);

    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });

      localStorage.setItem('token', res.data.token);
      await refreshProfile();

      let destination = location.state?.returnTo as string | undefined;
      const intent: SignInIntent =
        signInIntent ?? (location.state?.signInIntent as SignInIntent | undefined) ?? 'student';
      setSignInIntent(intent);

      if (intent === 'student' && destination && isEducatorRoute(destination)) {
        destination = undefined;
      }

      try {
        const onboarding = await fetchOnboarding();
        if (onboarding.completed) {
          localStorage.setItem(INTERESTS_KEY, JSON.stringify(onboarding.interestIds ?? []));
          localStorage.setItem(EDUCATORS_KEY, JSON.stringify(onboarding.followedCreatorIds ?? []));
          if (!destination) {
            destination = intent === 'creator' ? CREATOR_HOME_PATH : '/dashboard';
          }
        } else if (!destination) {
          destination = intent === 'creator' ? CREATOR_HOME_PATH : '/onboarding';
        }
      } catch {
        const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
        if (!destination) {
          if (intent === 'creator') {
            destination = CREATOR_HOME_PATH;
          } else {
            destination = hasInterests ? '/dashboard' : '/onboarding';
          }
        }
      }

      navigate(destination, {
        state: {
          ...location.state,
          ...(intent ? { signInIntent: intent } : {}),
        },
      });
    } catch (error) {
      console.error('Login Failed', error);
      setSignInError('Sign-in failed. Please try again.');
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative">
      {isSigningIn && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(8,8,11,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(225,6,0,0.35)', borderTopColor: '#e10600' }}
          />
          <p className="text-sm font-medium text-white/80">Signing you in…</p>
          <p className="text-xs text-white/45">Loading your profile</p>
        </div>
      )}
      <div style={{ opacity: isSigningIn ? 0.5 : 1, pointerEvents: isSigningIn ? 'none' : 'auto' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setSignInError('Google sign-in was cancelled or failed.')}
          theme={theme}
          size={size}
          width={width}
          text="continue_with"
          shape="pill"
        />
      </div>
      {signInError && (
        <p className="mt-2 text-sm text-center" style={{ color: '#e10600' }}>{signInError}</p>
      )}
    </div>
  );
}

export default GoogleLoginButton;
