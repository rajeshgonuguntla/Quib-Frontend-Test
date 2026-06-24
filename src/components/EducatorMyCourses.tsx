import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { fetchOwnedCourses } from '../api/educatorApi';
import { deleteCourse, unpublishCourse } from '../api/catalogApi';
import type { OwnedCourseSummary } from '../types/courseGeneration';
import { ytThumb } from '../utils/catalogMap';
import { PageHeader } from '../shell/PageHeader';
import { useRequireEducatorExperience } from '../hooks/useRequireEducatorExperience';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

type Filter = 'all' | 'drafts' | 'published';

export function EducatorMyCourses() {
  useRequireEducatorExperience();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<OwnedCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await fetchOwnedCourses());
    } catch {
      setCourses([]);
      setError('Could not load your courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'drafts') return courses.filter((c) => !c.published);
    if (filter === 'published') return courses.filter((c) => c.published);
    return courses;
  }, [courses, filter]);

  const handleUnpublish = async (courseId: string) => {
    setBusyId(courseId);
    try {
      await unpublishCourse(courseId);
      await load();
    } catch {
      setError('Could not unpublish course.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (course: OwnedCourseSummary) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    if (course.published && !window.confirm('This course is published. Unpublish first if learners are enrolled.')) return;
    setBusyId(course.courseId);
    try {
      await deleteCourse(course.courseId);
      await load();
    } catch (err) {
      const message = axiosMessage(err) ?? 'Could not delete course.';
      setError(message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        label="Create"
        title="My courses"
        description="Drafts and published courses you have built on Quib."
        actions={
          <Button size="sm" onClick={() => navigate('/educator-studio')}>
            <Plus size={14} /> New course
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({courses.filter((c) => !c.published).length})</TabsTrigger>
          <TabsTrigger value="published">Published ({courses.filter((c) => c.published).length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" size={16} /> Loading your courses…
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <BookOpen className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No courses yet.</p>
          <Button className="mt-4" size="sm" onClick={() => navigate('/educator-studio')}>
            Open Studio
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => {
            const thumb = course.youtubeVideoId ? ytThumb(course.youtubeVideoId) : undefined;
            const busy = busyId === course.courseId;
            return (
              <Card key={course.courseId} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="aspect-video w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-36">
                  {thumb ? <img src={thumb} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-medium">{course.title}</h2>
                    <Badge variant="muted">{course.published ? 'Published' : 'Draft'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {course.moduleCount} modules · {course.difficulty ?? 'Mixed'}
                    {course.channelName ? ` · ${course.channelName}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => navigate(`/course-details/${course.courseId}`)}>
                    View
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => navigate(`/educator-courses/${course.courseId}/edit`)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  {course.published && (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleUnpublish(course.courseId)}>
                      Unpublish
                    </Button>
                  )}
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => void handleDelete(course)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function axiosMessage(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: string } } }).response?.data;
    return data?.message ?? null;
  }
  return null;
}
