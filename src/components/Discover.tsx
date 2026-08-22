import { useSearchParams, Navigate } from 'react-router';
import { BookOpen, Users } from 'lucide-react';
import { PageHeader } from '../shell/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BrowseCourses } from './BrowseCourses';
import { Creators } from './Creators';

type DiscoverTab = 'courses' | 'creators';

const TAB_META: Record<DiscoverTab, { title: string; description: string }> = {
  courses: {
    title: 'Discover',
    description: 'Published courses from educators on Cuib.',
  },
  creators: {
    title: 'Discover',
    description: 'Trending educators and channels with courses on Cuib.',
  },
};

function normalizeTab(raw: string | null): DiscoverTab {
  return raw === 'creators' ? 'creators' : 'courses';
}

/** Old /browse-courses bookmarks → Discover. */
export function BrowseCoursesRedirect() {
  return <Navigate to="/discover?tab=courses" replace />;
}

/** Old /creators bookmarks → Discover. */
export function CreatorsRedirect() {
  return <Navigate to="/discover?tab=creators" replace />;
}

export function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = normalizeTab(searchParams.get('tab'));
  const meta = TAB_META[tab];

  const setTab = (next: string) => {
    setSearchParams({ tab: next }, { replace: true });
  };

  return (
    <div>
      <PageHeader
        label="Catalog"
        title={meta.title}
        description={meta.description}
      />

      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="h-10 w-full justify-start gap-0.5 overflow-x-auto sm:w-auto">
          <TabsTrigger value="courses" className="gap-1.5 px-3.5">
            <BookOpen size={14} />
            Courses
          </TabsTrigger>
          <TabsTrigger value="creators" className="gap-1.5 px-3.5">
            <Users size={14} />
            Creators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <BrowseCourses embedded />
        </TabsContent>

        <TabsContent value="creators">
          <Creators embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
