import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUserProfile } from '../context/UserProfileContext';
import { isEducatorAccount, isEducatorExperience } from '../utils/signInIntent';

export function useRequireEducatorExperience() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (loading) return;
    // ponytail: CREATOR_FLOW hides studio nav; educator accounts still edit from course details.
    if (isEducatorAccount(profile) || isEducatorExperience(profile)) return;
    navigate('/dashboard', { replace: true });
  }, [navigate, profile, loading]);
}
