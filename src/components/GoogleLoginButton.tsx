import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router';

function GoogleLoginButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error('Login Failed: missing Google credential');
      return;
    }

    try {
      const apiBase = import.meta.env.PROD
        ? 'https://quib-app-backend-944587700647.europe-west1.run.app'
        : '';
      const res = await axios.post(`${apiBase}/api/auth/google`, {
        token: credentialResponse.credential,
      });

      localStorage.setItem('token', res.data.token);

      const returnTo = location.state?.returnTo || '/dashboard';
      navigate(returnTo, { state: location.state });
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