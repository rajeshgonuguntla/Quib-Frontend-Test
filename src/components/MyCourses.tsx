import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { CheckCircle2, Circle } from 'lucide-react';
import { fetchEnrollments } from '../api/catalogApi';
import type { EnrollmentSummary } from '../types/catalog';
import { ytThumb } from '../utils/catalogMap';
import { PageHeader } from '../shell/PageHeader';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

type Filter = 'in_progress' | 'completed';

export function MyCourses() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get('filter') as Filter) || 'in_progress';
  const [enrollments, setEnrollments] = useState<EnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments()
      .then(setEnrollments)
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'completed') {
      return enrollments.filter((e) => e.status === 'completed' || (e.progress ?? 0) >= 100);
    }
    return enrollments.filter((e) => e.status !== 'completed' && (e.progress ?? 0) < 100);
  }, [enrollments, filter]);

  return (
    <div>
      <PageHeader
        label="Library"
        title="My courses"
        description={filter === 'completed' ? 'Courses you have finished.' : 'Pick up where you left off.'}
      />

      <Tabs value={filter} onValueChange={(v) => setSearchParams({ filter: v })} className="mb-8">
        <TabsList>
          <TabsTrigger value="in_progress" className="gap-1.5">
            <Circle size={14} /> In progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 size={14} /> Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="flex gap-4 p-4">
              <Skeleton className="aspect-video w-28 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-px w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center text-sm text-muted-foreground">
          {filter === 'completed' ? 'No completed courses yet.' : 'No courses in progress.'}
        </Card>
      ) : (
        <StaggerChildren className="space-y-2">
          {filtered.map((e) => {
            const thumb = e.youtubeVideoId ? ytThumb(e.youtubeVideoId) : undefined;
            const pct = Math.round(e.progress ?? 0);
            return (
              <StaggerItem key={e.courseId}>
                <Card
                  className="flex cursor-pointer gap-4 p-4 transition-colors hover:border-border/80"
                  onClick={() => navigate(`/course-details/${e.courseId}`)}
                >
                  <div className="aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-medium">{e.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {e.channel || e.category} · {filter === 'completed' ? 'Completed' : `${pct}% complete`}
                    </p>
                    {filter !== 'completed' && (
                      <div className="mt-3 h-px overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-[var(--brand)]" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      )}
    </div>
  );
}
