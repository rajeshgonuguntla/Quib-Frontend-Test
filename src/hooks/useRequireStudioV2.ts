import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isStudioV2Account } from '../utils/signInIntent';

/** Admin only. Educators, learners, and signed-out sessions go to Home. */
export function useRequireStudioV2() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    if (isStudioV2Account(profile)) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, profile, loading]);
}
