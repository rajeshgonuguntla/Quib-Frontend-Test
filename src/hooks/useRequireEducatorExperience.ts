import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isEducatorExperience } from '../utils/signInIntent';

export function useRequireEducatorExperience() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEducatorExperience()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);
}
