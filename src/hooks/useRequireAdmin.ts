import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';

export function useRequireAdmin() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    if (!isAdminAccount(profile)) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, profile, loading]);
}
