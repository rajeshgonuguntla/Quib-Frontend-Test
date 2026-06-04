import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { fetchOnboarding } from '../api/catalogApi';
import { INTERESTS_KEY, EDUCATORS_KEY } from './Onboarding';

function GoogleLoginButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useUserProfile();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('Login Failed: missing Google credential');
      return;
    }

    try {
      const res = await axios.post('/api/auth/google', {
        token: credentialResponse.credential,
      });

      localStorage.setItem('token', res.data.token);
      await refreshProfile();

      let destination = location.state?.returnTo as string | undefined;
      try {
        const onboarding = await fetchOnboarding();
        if (onboarding.completed) {
          localStorage.setItem(INTERESTS_KEY, JSON.stringify(onboarding.interestIds ?? []));
          localStorage.setItem(EDUCATORS_KEY, JSON.stringify(onboarding.followedCreatorIds ?? []));
          destination = destination || '/dashboard';
        } else {
          destination = '/onboarding';
        }
      } catch {
        const hasInterests = !!localStorage.getItem(INTERESTS_KEY);
        destination = destination || (hasInterests ? '/dashboard' : '/onboarding');
      }

      navigate(destination, { state: location.state });
    } catch (error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
    </div>
  );
}

export default GoogleLoginButton;