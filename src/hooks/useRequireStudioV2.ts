import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isEducatorAccount } from '../utils/signInIntent';

/** Educator and admin stay. A learner and a signed-out session go to Home. */
export function useRequireStudioV2() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    if (isEducatorAccount(profile)) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, profile, loading]);
}
