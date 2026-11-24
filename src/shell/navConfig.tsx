import type { ReactNode } from 'react';
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  Home,
  LineChart,
  ListChecks,
  Notebook,
  PenLine,
  Settings,
  Shield,
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
    label: '',
    items: [
      { id: 'home', label: 'Home', path: '/dashboard', icon: <Home size={17} /> },
      { id: 'my-courses', label: 'My courses', path: '/my-courses', icon: <BookOpen size={17} /> },
      { id: 'practice', label: 'Practice', path: '/practice', icon: <PenLine size={17} /> },
      { id: 'notes', label: 'Notes', path: '/notes', icon: <Notebook size={17} /> },
      { id: 'review', label: 'Review', path: '/review', icon: <ListChecks size={17} /> },
      { id: 'progress', label: 'Progress', path: '/library?tab=all', icon: <LineChart size={17} /> },
      { id: 'admin-insights', label: 'Platform insights', path: '/admin/insights', icon: <Shield size={17} /> },
      { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={17} /> },
    ],
  },
];

/** Creator rail when Studio v2 is on. Settings stays a footer item in AppSidebar. */
export const EDUCATOR_NAV_GROUPS: NavGroup[] = [
  {
    label: 'Create',
    items: [
      { id: 'studio', label: 'Cubit Studio', path: '/educator-studio', icon: <GraduationCap size={17} /> },
      { id: 'published-courses', label: 'Published courses', path: '/educator-courses/published', icon: <BookOpen size={17} /> },
      { id: 'my-courses-educator', label: 'My courses', path: '/educator-courses', icon: <BookMarked size={17} /> },
    ],
  },
  {
    label: '',
    items: [
      { id: 'settings', label: 'Settings', path: '/settings', icon: <Settings size={17} /> },
    ],
  },
];

export function isNavItemActive(pathname: string, _search: string, id: string, path: string): boolean {
  if (id === 'home' || id === 'dashboard') return pathname === '/dashboard' || pathname === '/home';
  if (id === 'my-courses') {
    return pathname.startsWith('/my-courses') || pathname.startsWith('/course-details');
  }
  if (id === 'practice') {
    return (
      pathname.startsWith('/practice')
      || pathname.startsWith('/quiz-setup')
      || pathname.startsWith('/playlist-setup')
    );
  }
  if (id === 'notes') return pathname.startsWith('/notes');
  if (id === 'review') return pathname.startsWith('/review') || pathname.startsWith('/results');
  if (id === 'progress') {
    return pathname.startsWith('/library')
      || pathname.startsWith('/my-quizzes')
      || pathname.startsWith('/certificates');
  }
  if (id === 'studio') return pathname.startsWith('/educator-studio');
  if (id === 'published-courses') return pathname.startsWith('/educator-courses/published');
  if (id === 'my-courses-educator') {
    return pathname.startsWith('/educator-courses') && !pathname.startsWith('/educator-courses/published');
  }
  if (id === 'educator-analytics') return pathname.startsWith('/educator-analytics');
  if (id === 'admin-insights') return pathname.startsWith('/admin/insights');
  if (id === 'settings') return pathname.startsWith('/settings');
  if (id === 'upgrade') return pathname.startsWith('/upgrade');
  return pathname === path || pathname === path.split('?')[0];
}

export type RouteMeta = {
  title: string;
  parent?: { label: string; path: string };
  section?: string;
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Home', section: 'Home' },
  '/discover': { title: 'Discover', section: 'Catalog', parent: { label: 'Home', path: '/dashboard' } },
  '/browse-courses': { title: 'Discover', section: 'Catalog', parent: { label: 'Home', path: '/dashboard' } },
  '/creators': { title: 'Discover', section: 'Catalog', parent: { label: 'Home', path: '/dashboard' } },
  '/my-courses': { title: 'My courses', section: 'Learn', parent: { label: 'Home', path: '/dashboard' } },
  '/practice': { title: 'Practice', section: 'Learn', parent: { label: 'Home', path: '/dashboard' } },
  '/notes': { title: 'Notes', section: 'Learn', parent: { label: 'Home', path: '/dashboard' } },
  '/review': { title: 'Review', section: 'Learn', parent: { label: 'Home', path: '/dashboard' } },
  '/library': { title: 'Progress', section: 'Library', parent: { label: 'Home', path: '/dashboard' } },
  '/my-quizzes': { title: 'Progress', section: 'Library', parent: { label: 'Home', path: '/dashboard' } },
  '/certificates': { title: 'Certificates', section: 'Library', parent: { label: 'Home', path: '/dashboard' } },
  '/educator-studio': { title: 'Cubit Studio', section: 'Create', parent: { label: 'Home', path: '/dashboard' } },
  '/educator-courses': { title: 'My courses', section: 'Create', parent: { label: 'Home', path: '/dashboard' } },
  '/educator-courses/published': { title: 'Published courses', section: 'Create', parent: { label: 'Home', path: '/dashboard' } },
  '/educator-analytics': { title: 'Analytics', section: 'Insights', parent: { label: 'Home', path: '/dashboard' } },
  '/admin/insights': { title: 'Platform Insights', section: 'Admin', parent: { label: 'Home', path: '/dashboard' } },
  '/settings': { title: 'Settings', section: 'Account', parent: { label: 'Home', path: '/dashboard' } },
  '/upgrade': { title: 'Upgrade', section: 'Plan', parent: { label: 'Home', path: '/dashboard' } },
  '/upgrade/success': { title: 'Subscription', section: 'Plan', parent: { label: 'Upgrade', path: '/upgrade' } },
  '/quiz-setup': { title: 'Quiz setup', section: 'Practice', parent: { label: 'Practice', path: '/practice' } },
  '/playlist-setup': { title: 'Playlist setup', section: 'Practice', parent: { label: 'Practice', path: '/practice' } },
};

export function getRouteMeta(pathname: string): RouteMeta {
  if (/^\/educator-studio\/[^/]+/.test(pathname)) {
    return { title: 'Cubit Studio', section: 'Create', parent: { label: 'My courses', path: '/educator-courses' } };
  }
  if (pathname.startsWith('/educator-courses/published')) {
    return ROUTE_META['/educator-courses/published']!;
  }
  if (pathname.startsWith('/educator-courses/')) {
    return { title: 'Edit course', section: 'Create', parent: { label: 'My courses', path: '/educator-courses' } };
  }
  if (pathname.startsWith('/educator/')) {
    return { title: 'Creator', section: 'Discover', parent: { label: 'Home', path: '/dashboard' } };
  }
  if (pathname.startsWith('/quiz-setup/')) return ROUTE_META['/quiz-setup']!;
  if (pathname.startsWith('/playlist-setup/')) return ROUTE_META['/playlist-setup']!;
  if (pathname.startsWith('/course-details')) {
    return { title: 'Course', section: 'Learn', parent: { label: 'My courses', path: '/my-courses' } };
  }
  if (pathname.startsWith('/results/')) {
    return { title: 'Results', section: 'Review', parent: { label: 'Review', path: '/review' } };
  }
  return ROUTE_META[pathname] ?? { title: 'Cubit', section: 'Home' };
}

export const FULL_BLEED_PATHS = ['/onboarding', '/quiz/', '/certificate/'];

export function isFullBleedRoute(pathname: string): boolean {
  return FULL_BLEED_PATHS.some((p) => pathname.startsWith(p) || pathname === p.replace(/\/$/, ''));
}
