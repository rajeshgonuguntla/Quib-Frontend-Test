import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isAdminAccount } from '../utils/signInIntent';

/** Postgres admins only. Educators, learners, and signed-out sessions go to Home. */
export function useRequireStudioV2() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    if (isAdminAccount(profile)) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, profile, loading]);
}
