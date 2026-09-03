import { useSearchParams, Navigate } from 'react-router';
import { BrowseCourses } from './BrowseCourses';
import { Creators } from './Creators';

function normalizeTab(raw: string | null): 'courses' | 'creators' {
  return raw === 'creators' ? 'creators' : 'courses';
}

/** Old /browse-courses bookmarks → Browse. */
export function BrowseCoursesRedirect() {
  return <Navigate to="/discover?tab=courses" replace />;
}

/** Old /creators bookmarks → Creators. */
export function CreatorsRedirect() {
  return <Navigate to="/discover?tab=creators" replace />;
}

export function Discover() {
  const [searchParams] = useSearchParams();
  const tab = normalizeTab(searchParams.get('tab'));
  if (tab === 'creators') return <Creators />;
  return <BrowseCourses />;
}
