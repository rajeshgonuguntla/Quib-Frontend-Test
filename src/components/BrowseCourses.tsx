import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { fetchCourses } from '../api/catalogApi';
import type { CatalogCourseSummary } from '../types/catalog';
import { courseToCuratedCard } from '../utils/catalogMap';
import { PageHeader } from '../shell/PageHeader';
import { StaggerChildren, StaggerItem } from '../shell/motion';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

export function BrowseCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CatalogCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCourses({ limit: 100 })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q) || c.channelName?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        label="Courses"
        title="Browse"
        description="Published courses from educators on Quib."
      />

      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, category, or channel…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center text-sm text-muted-foreground">No published courses yet.</Card>
      ) : (
        <StaggerChildren className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const card = courseToCuratedCard(course);
            return (
              <StaggerItem key={course.courseId}>
                <Card
                  className="group cursor-pointer overflow-hidden transition-colors hover:border-border/80"
                  onClick={() => navigate(`/course-details/${course.courseId}`)}
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={card.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                  </div>
                  <div className="p-4">
                    <Badge variant="muted">{card.tag}</Badge>
                    <h2 className="mt-2 text-sm font-medium leading-snug">{card.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{card.instructor}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {course.moduleCount ?? '—'} modules · {course.difficulty ?? 'Mixed'}
                    </p>
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
