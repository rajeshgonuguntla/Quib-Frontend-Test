import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Search } from 'lucide-react';
import { fetchCourses } from '../api/catalogApi';
import { CONTENT_LANGUAGES } from '../types/courseGeneration';
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
  const [language, setLanguage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchCourses({ limit: 100, language: language || undefined })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [language]);

  const filtered = courses.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.title?.toLowerCase().includes(q)
      || c.category?.toLowerCase().includes(q)
      || c.channelName?.toLowerCase().includes(q)
      || c.ownerDisplayName?.toLowerCase().includes(q)
      || c.educatorChannelTitle?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        label="Courses"
        title="Browse"
        description="Published courses from educators on Quib."
      />

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category, or educator…"
            className="pl-9"
          />
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">All languages</option>
          {CONTENT_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
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
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="muted">{card.tag}</Badge>
                        {card.language && card.language !== 'en' && (
                          <Badge variant="outline">{card.language.toUpperCase()}</Badge>
                        )}
                      </div>
                      <h2 className="mt-2 text-sm font-medium leading-snug">{card.title}</h2>
                      <div className="mt-2 flex items-center gap-2">
                        {card.instructorAvatar ? (
                          <img src={card.instructorAvatar} alt="" className="size-5 rounded-full object-cover" />
                        ) : null}
                        <p className="text-xs text-muted-foreground">{card.instructor}</p>
                      </div>
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
