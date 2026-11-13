import { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import {
  completeGoogleSignIn,
  takeLearnerStartState,
  type LearnerStartState,
} from '../utils/completeGoogleSignIn';

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
  const { setProfile } = useUserProfile();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsSigningIn(true);
    if (onLoginBlocked) {
      onLoginBlocked(null);
    } else {
      setSignInError(null);
    }

    const stashed = takeLearnerStartState();
    const locationState = (location.state as LearnerStartState | null) ?? null;
    const result = await completeGoogleSignIn({
      credentialResponse,
      navigate,
      setProfile,
      signInIntent,
      pendingState: { ...(locationState ?? {}), ...(stashed ?? {}) },
      search: location.search,
      onBlocked: (message) => {
        if (onLoginBlocked) onLoginBlocked(message);
        else setSignInError(message);
      },
    });

    if (!result.ok && !onLoginBlocked) {
      setSignInError(result.error);
    }
    setIsSigningIn(false);
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
            style={{ borderColor: 'rgba(255,122,26,0.35)', borderTopColor: '#ff7a1a' }}
          />
          <p className="text-sm font-medium text-white/80">Signing you in…</p>
          <p className="text-xs text-white/45">Almost there</p>
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
