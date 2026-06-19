import type { NavigateFunction } from 'react-router';
import { isTokenValid } from '../auth';

export function goToEducatorStudio(navigate: NavigateFunction, tab?: 'url' | 'channel') {
  const path = tab === 'url' ? '/educator-studio?tab=url' : '/educator-studio';
  if (isTokenValid()) {
    navigate(path);
  } else {
    navigate('/signin', { state: { returnTo: path } });
  }
}

export function goToProtectedPath(navigate: NavigateFunction, path: string) {
  if (isTokenValid()) {
    navigate(path);
  } else {
    navigate('/signin', { state: { returnTo: path } });
  }
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
