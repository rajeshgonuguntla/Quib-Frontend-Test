import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isEducatorExperience } from '../utils/signInIntent';

export function useRequireEducatorExperience() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    if (!isEducatorExperience(profile)) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, profile, loading]);
}
