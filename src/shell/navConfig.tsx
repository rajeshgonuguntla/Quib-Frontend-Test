import type { ReactNode } from 'react';
import {
  BookMarked,
  CheckCircle2,
  Circle,
  GraduationCap,
  HelpCircle,
  Home,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  badgeKey?: 'inProgress' | 'saved' | 'completed';
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Menu',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <Home size={15} /> },
      { id: 'browse', label: 'Browse', path: '/browse-courses', icon: <Search size={15} /> },
      { id: 'studio', label: 'Studio', path: '/educator-studio', icon: <GraduationCap size={15} /> },
      { id: 'my-courses-educator', label: 'My courses', path: '/educator-courses', icon: <BookMarked size={15} /> },
      { id: 'trending', label: 'Creators', path: '/creators', icon: <TrendingUp size={15} /> },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'progress', label: 'In progress', path: '/my-courses', icon: <Circle size={15} />, badgeKey: 'inProgress' },
      { id: 'saved', label: 'Saved', path: '/my-quizzes', icon: <BookMarked size={15} />, badgeKey: 'saved' },
      { id: 'completed', label: 'Completed', path: '/my-courses?filter=completed', icon: <CheckCircle2 size={15} />, badgeKey: 'completed' },
    ],
  },
  {
    label: 'Account',
    items: [
      { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={15} /> },
      { id: 'help', label: 'Help', path: '/settings?tab=help', icon: <HelpCircle size={15} /> },
    ],
  },
];

export function isNavItemActive(pathname: string, search: string, id: string, path: string): boolean {
  if (id === 'dashboard') return pathname === '/dashboard' || pathname === '/home';
  if (id === 'browse') return pathname.startsWith('/browse-courses');
  if (id === 'studio') return pathname.startsWith('/educator-studio');
  if (id === 'my-courses-educator') return pathname.startsWith('/educator-courses');
  if (id === 'trending') return pathname.startsWith('/creators') || pathname.startsWith('/educator/');
  if (id === 'progress') return pathname.startsWith('/my-courses') && !search.includes('filter=completed');
  if (id === 'completed') return pathname.startsWith('/my-courses') && search.includes('filter=completed');
  if (id === 'saved') return pathname.startsWith('/my-quizzes') || pathname.startsWith('/certificates');
  if (id === 'settings') return pathname.startsWith('/settings') && !search.includes('tab=');
  if (id === 'help') return pathname.startsWith('/settings') && search.includes('tab=help');
  return pathname === path;
}

export type RouteMeta = {
  title: string;
  parent?: { label: string; path: string };
  section?: string;
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Overview', section: 'Dashboard' },
  '/browse-courses': { title: 'Browse', section: 'Courses', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/creators': { title: 'Creators', section: 'Discover', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/my-courses': { title: 'My courses', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/my-quizzes': { title: 'Saved quizzes', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/certificates': { title: 'Certificates', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/educator-studio': { title: 'Studio', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/educator-courses': { title: 'My courses', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/settings': { title: 'Settings', section: 'Account', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/quiz-setup': { title: 'Quiz setup', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/playlist-setup': { title: 'Playlist setup', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (pathname.startsWith('/educator-courses/')) {
    return { title: 'Edit course', section: 'Create', parent: { label: 'My courses', path: '/educator-courses' } };
  }
  if (pathname.startsWith('/educator/')) {
    return { title: 'Creator', section: 'Creators', parent: { label: 'Creators', path: '/creators' } };
  }
  if (pathname.startsWith('/quiz-setup/')) return ROUTE_META['/quiz-setup']!;
  if (pathname.startsWith('/playlist-setup/')) return ROUTE_META['/playlist-setup']!;
  if (pathname.startsWith('/course-details')) {
    return { title: 'Course', section: 'Courses', parent: { label: 'Browse', path: '/browse-courses' } };
  }
  if (pathname.startsWith('/results/')) {
    return { title: 'Results', section: 'Quiz', parent: { label: 'Dashboard', path: '/dashboard' } };
  }
  return ROUTE_META[pathname] ?? { title: 'Quib', section: 'Dashboard' };
}

export const FULL_BLEED_PATHS = ['/onboarding', '/quiz/', '/certificate/'];

export function isFullBleedRoute(pathname: string): boolean {
  return FULL_BLEED_PATHS.some((p) => pathname.startsWith(p) || pathname === p.replace(/\/$/, ''));
}
