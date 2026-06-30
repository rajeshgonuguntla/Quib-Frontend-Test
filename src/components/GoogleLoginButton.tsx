import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { fetchUserProfileWithToken } from '../api/userApi';
import { fetchOnboarding } from '../api/catalogApi';
import { clearToken, notifyAuthChanged } from '../auth';
import { INTERESTS_KEY, EDUCATORS_KEY } from './Onboarding';
import {
  EDUCATOR_USE_CREATOR_LOGIN_MESSAGE,
  isEducatorAccount,
  isEducatorRoute,
  resolveDefaultDestination,
  setSignInIntent,
  type SignInIntent,
} from '../utils/signInIntent';

type GoogleLoginButtonProps = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string | number;
  signInIntent?: 'creator' | 'student';
  onLoginBlocked?: (message: string | null) => void;
};

function GoogleLoginButton({
  theme = 'outline',
  size = 'large',
  width,
  signInIntent,
  onLoginBlocked,
}: GoogleLoginButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useUserProfile();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const showBlocked = (message: string) => {
    if (onLoginBlocked) {
      onLoginBlocked(message);
    } else {
      setSignInError(message);
    }
  };

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setSignInError('Login failed — missing Google credential.');
      return;
    }

    setIsSigningIn(true);
    if (onLoginBlocked) {
      onLoginBlocked(null);
    } else {
      setSignInError(null);
    }

    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });

      const jwt = res.data.token as string;
      const profile = await fetchUserProfileWithToken(jwt);

      const intent: SignInIntent =
        signInIntent ?? (location.state?.signInIntent as SignInIntent | undefined) ?? 'student';

      if (intent === 'student' && isEducatorAccount(profile)) {
        clearToken();
        showBlocked(EDUCATOR_USE_CREATOR_LOGIN_MESSAGE);
        setIsSigningIn(false);
        return;
      }

      localStorage.setItem('token', jwt);
      notifyAuthChanged();
      await refreshProfile();

      const effectiveIntent: SignInIntent = isEducatorAccount(profile) ? 'creator' : intent;
      setSignInIntent(effectiveIntent);

      let destination = location.state?.returnTo as string | undefined;

      if (effectiveIntent === 'student' && destination && isEducatorRoute(destination)) {
        destination = undefined;
      }

      try {
        const onboarding = await fetchOnboarding();
        if (onboarding.completed) {
          localStorage.setItem(INTERESTS_KEY, JSON.stringify(onboarding.interestIds ?? []));
          localStorage.setItem(EDUCATORS_KEY, JSON.stringify(onboarding.followedCreatorIds ?? []));
          if (!destination) {
            destination = resolveDefaultDestination(profile, effectiveIntent, true);
          }
        } else if (!destination) {
          destination = resolveDefaultDestination(profile, effectiveIntent, false);
        }
      } catch {
        const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
        if (!destination) {
          destination = resolveDefaultDestination(profile, effectiveIntent, hasInterests);
        }
      }

      navigate(destination, {
        state: {
          ...location.state,
          signInIntent: effectiveIntent,
        },
      });
    } catch (error) {
      console.error('Login Failed', error);
      clearToken();
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
        <div
          className="mt-3 rounded-lg border px-3 py-2.5 text-[0.8rem] leading-relaxed"
          style={{
            borderColor: 'rgba(225,6,0,0.35)',
            background: 'rgba(225,6,0,0.08)',
            color: '#c50500',
          }}
          role="alert"
        >
          {signInError}
        </div>
      )}
    </div>
  );
}

export default GoogleLoginButton;
