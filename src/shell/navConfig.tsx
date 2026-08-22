import type { ReactNode } from 'react';
import {
  BarChart3,
  BookMarked,
  Compass,
  GraduationCap,
  HelpCircle,
  Home,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  badgeKey?: 'inProgress' | 'saved' | 'completed' | 'total';
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
      { id: 'discover', label: 'Discover', path: '/discover', icon: <Compass size={15} /> },
      { id: 'upgrade', label: 'Upgrade', path: '/upgrade', icon: <Sparkles size={15} /> },
      { id: 'studio', label: 'Studio', path: '/educator-studio', icon: <GraduationCap size={15} /> },
      { id: 'my-courses-educator', label: 'My courses', path: '/educator-courses', icon: <BookMarked size={15} /> },
      { id: 'educator-analytics', label: 'Analytics', path: '/educator-analytics', icon: <BarChart3 size={15} /> },
      { id: 'admin-insights', label: 'Platform insights', path: '/admin/insights', icon: <Shield size={15} /> },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'library', label: 'Library', path: '/library', icon: <BookMarked size={15} />, badgeKey: 'total' },
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
  if (id === 'discover') {
    return pathname.startsWith('/discover')
      || pathname.startsWith('/browse-courses')
      || pathname.startsWith('/creators')
      || pathname.startsWith('/educator/');
  }
  if (id === 'studio') return pathname.startsWith('/educator-studio');
  if (id === 'my-courses-educator') return pathname.startsWith('/educator-courses');
  if (id === 'educator-analytics') return pathname.startsWith('/educator-analytics');
  if (id === 'admin-insights') return pathname.startsWith('/admin/insights');
  if (id === 'library') {
    return pathname.startsWith('/library')
      || pathname.startsWith('/my-courses')
      || pathname.startsWith('/my-quizzes')
      || pathname.startsWith('/certificates');
  }
  if (id === 'settings') return pathname.startsWith('/settings') && !search.includes('tab=');
  if (id === 'help') return pathname.startsWith('/settings') && search.includes('tab=help');
  if (id === 'upgrade') return pathname.startsWith('/upgrade');
  return pathname === path;
}

export type RouteMeta = {
  title: string;
  parent?: { label: string; path: string };
  section?: string;
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Overview', section: 'Dashboard' },
  '/discover': { title: 'Discover', section: 'Catalog', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/browse-courses': { title: 'Discover', section: 'Catalog', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/creators': { title: 'Discover', section: 'Catalog', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/library': { title: 'Library', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/my-courses': { title: 'Library', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/my-quizzes': { title: 'Library', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/certificates': { title: 'Certificates', section: 'Library', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/educator-studio': { title: 'Studio', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/educator-courses': { title: 'My courses', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/educator-analytics': { title: 'Analytics', section: 'Insights', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/admin/insights': { title: 'Platform insights', section: 'Admin', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/settings': { title: 'Settings', section: 'Account', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/upgrade': { title: 'Upgrade', section: 'Unlimited', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/upgrade/success': { title: 'Subscription', section: 'Unlimited', parent: { label: 'Upgrade', path: '/upgrade' } },
  '/quiz-setup': { title: 'Quiz setup', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
  '/playlist-setup': { title: 'Playlist setup', section: 'Create', parent: { label: 'Dashboard', path: '/dashboard' } },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (pathname.startsWith('/educator-courses/')) {
    return { title: 'Edit course', section: 'Create', parent: { label: 'My courses', path: '/educator-courses' } };
  }
  if (pathname.startsWith('/educator/')) {
    return { title: 'Creator', section: 'Discover', parent: { label: 'Discover', path: '/discover?tab=creators' } };
  }
  if (pathname.startsWith('/quiz-setup/')) return ROUTE_META['/quiz-setup']!;
  if (pathname.startsWith('/playlist-setup/')) return ROUTE_META['/playlist-setup']!;
  if (pathname.startsWith('/course-details')) {
    return { title: 'Course', section: 'Catalog', parent: { label: 'Discover', path: '/discover?tab=courses' } };
  }
  if (pathname.startsWith('/results/')) {
    return { title: 'Results', section: 'Quiz', parent: { label: 'Dashboard', path: '/dashboard' } };
  }
  return ROUTE_META[pathname] ?? { title: 'Cuib', section: 'Dashboard' };
}

export const FULL_BLEED_PATHS = ['/onboarding', '/quiz/', '/certificate/'];

export function isFullBleedRoute(pathname: string): boolean {
  return FULL_BLEED_PATHS.some((p) => pathname.startsWith(p) || pathname === p.replace(/\/$/, ''));
}
