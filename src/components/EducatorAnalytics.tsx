import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  Layers,
  Loader2,
  MessageCircle,
  Monitor,
  PlayCircle,
  Smartphone,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import {
  fetchEducatorAnalyticsDashboard,
  fetchEducatorCourseAnalytics,
  dismissContentFlag,
  resolveContentFlag,
  type EducatorAnalyticsDashboard,
  type EducatorCourseAnalyticsDetail,
  type EducatorCourseMetrics,
  type ContentFlag,
} from '../api/educatorAnalyticsApi';
import { replyToLearnerComment } from '../api/courseFeedbackApi';
import { PageHeader } from '../shell/PageHeader';
import { useRequireEducatorExperience } from '../hooks/useRequireEducatorExperience';
import { formatPriceCents } from '../utils/formatPrice';
import { getMaintenanceSignalMeta } from '../utils/maintenanceSignals';
import { EnrollmentTrendPanel } from './analytics/EnrollmentTrendPanel';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

export function EducatorAnalytics() {
  useRequireEducatorExperience();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<EducatorAnalyticsDashboard | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetail, setCourseDetail] = useState<EducatorCourseAnalyticsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEducatorAnalyticsDashboard();
        if (mounted) {
          setDashboard({
            ...data,
            enrollmentTrends: data.enrollmentTrends ?? { daily: [], weekly: [], monthly: [] },
          });
        }
      } catch {
        if (mounted) {
          setDashboard(null);
          setError('Could not load analytics. Try again later.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const openCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setDetailLoading(true);
    setCourseDetail(null);
    setError(null);
    try {
      setCourseDetail(await fetchEducatorCourseAnalytics(courseId));
    } catch {
      setError('Could not load course analytics.');
      setSelectedCourseId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeCourse = () => {
    setSelectedCourseId(null);
    setCourseDetail(null);
  };

  const insightLine = useMemo(() => {
    if (!dashboard) return null;
    const { overview, courses } = dashboard;
    if (courses.length === 0) return 'Publish your first course to unlock learner insights.';
    const top = [...courses].sort((a, b) => b.enrollmentCount - a.enrollmentCount)[0];
    if (top && top.enrollmentCount > 0) {
      return `"${truncate(top.title, 42)}" leads with ${top.enrollmentCount} enrollment${top.enrollmentCount === 1 ? '' : 's'}.`;
    }
    if (overview.publishedCourses > 0) {
      return `${overview.publishedCourses} published course${overview.publishedCourses === 1 ? '' : 's'} — share links to start collecting data.`;
    }
    return 'Your drafts are ready — publish when you want learners to enroll.';
  }, [dashboard]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader label="Insights" title="Analytics" description="Loading your dashboard…" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="py-16 text-center">
        <AlertTriangle className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error ?? 'Analytics unavailable.'}</p>
      </div>
    );
  }

  const { overview } = dashboard;

  return (
    <div className="space-y-8">
      <PageHeader
        label="Insights"
        title="Analytics"
        description="Enrollment, completion, watch time, and quiz performance across your courses."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/educator-courses')}>
            My courses
          </Button>
        }
      />

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {insightLine && (
        <motion.div
          {...fadeUp}
          className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm"
          style={{ boxShadow: '0 0 0 1px var(--border), 0 8px 24px -12px var(--accent-glow)' }}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chart-1)]/10 text-[var(--chart-1)]">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">At a glance</p>
            <p className="mt-0.5 text-sm leading-relaxed text-foreground">{insightLine}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <StatCard
          icon={<Users className="size-4" />}
          label="Total enrollments"
          value={overview.totalEnrollments.toLocaleString()}
          accent
        />
        <StatCard
          icon={<DollarSign className="size-4" />}
          label="Total revenue"
          value={formatPriceCents(overview.totalRevenueCents ?? 0)}
          subValue="Gross sales"
        />
        <StatCard
          icon={<GraduationCap className="size-4" />}
          label="Avg completion"
          value={`${overview.avgCompletionRate.toFixed(1)}%`}
          subValue={overview.avgCompletionRate >= 50 ? 'Healthy' : 'Room to grow'}
        />
        <StatCard
          icon={<BookOpen className="size-4" />}
          label="Published"
          value={String(overview.publishedCourses)}
          hint={`${overview.draftCourses} draft${overview.draftCourses === 1 ? '' : 's'}`}
        />
        <StatCard
          icon={<Clock className="size-4" />}
          label="Watch time"
          value={formatWatchMinutes(overview.totalWatchMinutes ?? 0)}
        />
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="Action items"
          value={String(dashboard.maintenanceSignals.length)}
          warn={dashboard.maintenanceSignals.length > 0}
        />
      </motion.div>

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-[var(--chart-1)]" />
                <CardTitle className="text-base">Enrollment trend</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[0.65rem] font-normal">Daily · weekly · monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <EnrollmentTrendPanel trends={dashboard.enrollmentTrends} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[var(--chart-1)]" />
              <CardTitle className="text-base">Maintenance signals</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {dashboard.maintenanceSignals.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="mb-2 size-8 text-emerald-500/80" />
                <p className="text-sm font-medium">All clear</p>
                <p className="mt-1 text-xs text-muted-foreground">No issues detected across your courses.</p>
              </div>
            ) : (
              dashboard.maintenanceSignals.map((signal) => {
                const meta = getMaintenanceSignalMeta(signal.type);
                const Icon = meta.icon;
                return (
                  <button
                    key={`${signal.type}-${signal.courseId}-${signal.message}`}
                    type="button"
                    onClick={() => void openCourse(signal.courseId)}
                    className="w-full rounded-xl border border-border/80 p-3 text-left text-sm transition-all hover:border-[var(--chart-1)]/35 hover:bg-muted/40"
                  >
                    <div className="mb-2 flex items-start gap-3">
                      <span
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          background: signal.severity === 'alert'
                            ? 'color-mix(in srgb, var(--destructive) 12%, transparent)'
                            : 'color-mix(in srgb, var(--chart-1) 12%, transparent)',
                          color: signal.severity === 'alert' ? 'var(--destructive)' : 'var(--chart-1)',
                        }}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant={signal.severity === 'alert' ? 'destructive' : 'secondary'} className="text-[0.6rem]">
                            {meta.label}
                          </Badge>
                          <span className="truncate font-medium">{signal.courseTitle}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{signal.message}</p>
                        <p className="mt-1 text-[0.65rem] text-muted-foreground">{meta.hint}</p>
                      </div>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h2 className="font-serif-display text-lg tracking-tight">Your courses</h2>
          <Badge variant="secondary">{dashboard.courses.length}</Badge>
        </div>

        {dashboard.courses.length === 0 ? (
          <Card className="py-14 text-center">
            <BookOpen className="mx-auto mb-3 size-9 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Publish a course to start seeing analytics.</p>
            <Button className="mt-4" size="sm" onClick={() => navigate('/educator-courses')}>
              Go to My courses
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.courses.map((course, idx) => (
              <CourseCard
                key={course.courseId}
                course={course}
                selected={selectedCourseId === course.courseId}
                delay={idx * 0.04}
                onClick={() => void openCourse(course.courseId)}
              />
            ))}
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {selectedCourseId && (
          <motion.div
            key={selectedCourseId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-[var(--chart-1)]/20 shadow-lg">
              <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-muted/20">
                <div className="min-w-0">
                  <p className="text-label mb-1 text-muted-foreground">Course deep-dive</p>
                  <CardTitle className="truncate text-lg">
                    {courseDetail?.title ?? 'Loading…'}
                  </CardTitle>
                  {courseDetail && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={courseDetail.published ? 'default' : 'secondary'}>
                        {courseDetail.published ? 'Published' : 'Draft'}
                      </Badge>
                      {courseDetail.avgDaysToComplete != null && (
                        <Badge variant="outline" className="font-normal">
                          ~{courseDetail.avgDaysToComplete.toFixed(0)} days to complete
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={closeCourse} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {detailLoading || !courseDetail ? (
                  <div className="space-y-4 py-4">
                    <div className="grid gap-3 sm:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                      ))}
                    </div>
                    <div className="h-40 animate-pulse rounded-lg bg-muted" />
                  </div>
                ) : (
                  <CourseDetailPanel
                detail={courseDetail}
                courseId={selectedCourseId}
                onRefresh={() => void openCourse(selectedCourseId)}
              />
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  subValue,
  accent,
  warn,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  subValue?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        accent ? 'ring-1 ring-[var(--chart-1)]/25' : ''
      }`}
    >
      {accent && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, var(--chart-1), transparent)' }}
        />
      )}
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex size-8 items-center justify-center rounded-lg transition-colors ${
              warn
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground group-hover:bg-[var(--chart-1)]/10 group-hover:text-[var(--chart-1)]'
            }`}
          >
            {icon}
          </div>
          {subValue && (
            <span className="text-[0.65rem] font-medium text-muted-foreground">{subValue}</span>
          )}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function CourseCard({
  course,
  selected,
  delay,
  onClick,
}: {
  course: EducatorCourseMetrics;
  selected: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`group w-full rounded-xl border bg-card p-4 text-left transition-all duration-200 hover:shadow-md ${
        selected
          ? 'border-[var(--chart-1)]/40 ring-2 ring-[var(--chart-1)]/20'
          : 'border-border hover:border-foreground/15'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium leading-snug group-hover:text-foreground">
            {course.title}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {course.enrollmentCount} enrolled
            {(course.revenueCents ?? 0) > 0 && (
              <> · {formatPriceCents(course.revenueCents)} revenue</>
            )}
            {course.lastEnrollmentAt && (
              <> · last {formatRelative(course.lastEnrollmentAt)}</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={course.published ? 'default' : 'secondary'} className="text-[0.65rem]">
            {course.published ? 'Live' : 'Draft'}
          </Badge>
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[0.65rem]">
          <span className="text-muted-foreground">Completion</span>
          <span className="font-medium">{course.completionRate.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, course.completionRate)}%`,
              background: 'linear-gradient(90deg, var(--chart-1), color-mix(in srgb, var(--chart-1) 70%, #fff))',
            }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function CourseDetailPanel({
  detail,
  courseId,
  onRefresh,
}: {
  detail: EducatorCourseAnalyticsDetail;
  courseId: string;
  onRefresh: () => void;
}) {
  const maxFunnelReach = Math.max(1, ...detail.moduleFunnel.map((s) => s.reachPercent));
  const deviceTotal = (detail.deviceBreakdown ?? []).reduce((s, d) => s + d.eventCount, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MiniStat label="Enrollments" value={String(detail.enrollmentCount)} icon={<Users className="size-3.5" />} />
        <MiniStat
          label="Revenue"
          value={formatPriceCents(detail.revenueCents ?? 0)}
          icon={<DollarSign className="size-3.5" />}
        />
        <MiniStat
          label="Completion"
          value={`${detail.completionRate.toFixed(0)}%`}
          icon={<GraduationCap className="size-3.5" />}
          highlight={detail.completionRate >= 50}
        />
        <MiniStat label="Active (7d)" value={String(detail.activeStudents7d)} icon={<TrendingUp className="size-3.5" />} />
        <MiniStat label="Active (30d)" value={String(detail.activeStudents30d)} icon={<BarChart3 className="size-3.5" />} />
      </div>

      <Section title="Enrollment trend" icon={<TrendingUp className="size-4" />}>
        <EnrollmentTrendPanel trends={detail.enrollmentTrends} heightClass="h-28" />
      </Section>

      <Section title="Module retention funnel" icon={<Layers className="size-4" />}>
        {detail.moduleFunnel.length === 0 ? (
          <EmptyHint text="No module data yet — learners need to progress through modules." />
        ) : (
          <div className="space-y-3">
            {detail.moduleFunnel.map((step, idx) => (
              <div key={step.moduleId} className="group rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/30">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold"
                    style={{
                      background: `color-mix(in srgb, var(--chart-1) ${20 + idx * 8}%, transparent)`,
                      color: 'var(--chart-1)',
                    }}
                  >
                    {step.sortOrder + 1}
                  </span>
                  <p className="min-w-0 flex-1 truncate font-medium">{step.moduleTitle}</p>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {step.reachedCount}/{step.enrolledCount} · {step.reachPercent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step.reachPercent / maxFunnelReach) * 100}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.06, ease: 'easeOut' }}
                    style={{
                      background: 'linear-gradient(90deg, var(--chart-1), color-mix(in srgb, var(--chart-1) 50%, transparent))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <CourseMaintenanceSection detail={detail} courseId={courseId} onRefresh={onRefresh} />

      {(detail.moduleDropOff || detail.videoDropOff) && (
        <Section title="Biggest drop-off points" icon={<AlertTriangle className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            {detail.moduleDropOff && (
              <DropOffCard label="Module" point={detail.moduleDropOff} />
            )}
            {detail.videoDropOff && (
              <DropOffCard label="Video" point={detail.videoDropOff} />
            )}
          </div>
        </Section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Quiz performance" icon={<GraduationCap className="size-4" />}>
          {detail.quizStats.length === 0 ? (
            <EmptyHint text="No quiz attempts yet." />
          ) : (
            <div className="space-y-2">
              {detail.quizStats.map((q) => (
                <div
                  key={q.moduleId}
                  className="rounded-lg border border-border/60 px-3 py-2.5 text-sm"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{q.moduleTitle}</span>
                    {q.lowScoreFlag && (
                      <Badge variant="destructive" className="shrink-0 text-[0.6rem]">Low scores</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[0.65rem]">
                    <MetricPill label="Attempts" value={String(q.attemptCount)} />
                    <MetricPill label="Avg" value={`${q.avgScorePercent.toFixed(0)}%`} />
                    <MetricPill label="Pass" value={`${q.passRate.toFixed(0)}%`} />
                    <MetricPill label="Retake" value={`${q.retakeRate.toFixed(0)}%`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Video engagement" icon={<PlayCircle className="size-4" />}>
          {(detail.lessonVideos ?? []).length === 0 ? (
            <EmptyHint text="No lesson views recorded yet." />
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {(detail.lessonVideos ?? []).map((v) => (
                <div key={v.lessonId} className="rounded-lg border border-border/60 px-3 py-2.5">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{v.lessonTitle}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{v.moduleTitle}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {detail.enrollmentCount >= 5
                        && v.skippedCount * 100 / detail.enrollmentCount >= 30 && (
                        <Badge variant="destructive" className="text-[0.55rem]">High skip</Badge>
                      )}
                      <span className="text-xs font-medium tabular-nums">{v.viewCount} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, v.avgWatchPercent)}%`,
                          background: 'var(--chart-1)',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-[0.65rem] tabular-nums text-muted-foreground">
                      {v.avgWatchPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-3 text-[0.65rem] text-muted-foreground">
                    <span>{(v.rewatchRate ?? 0).toFixed(0)}% rewatch rate</span>
                    <span>{v.rewatchCount} rewatches</span>
                    <span>{v.skippedCount} skipped</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Activity by hour (UTC)" icon={<Clock className="size-4" />}>
          <HourActivityChart buckets={detail.activityByHour ?? []} />
        </Section>

        <Section title="Device breakdown" icon={<Monitor className="size-4" />}>
          {(detail.deviceBreakdown ?? []).length === 0 ? (
            <EmptyHint text="No device data yet." />
          ) : (
            <div className="space-y-3">
              {(detail.deviceBreakdown ?? []).map((d) => {
                const pct = deviceTotal > 0 ? (d.eventCount / deviceTotal) * 100 : 0;
                return (
                  <div key={d.deviceType}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 capitalize">
                        <DeviceIcon type={d.deviceType} />
                        {d.deviceType}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {pct.toFixed(0)}% · {d.eventCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground/70 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {(detail.mostFailedQuestions ?? []).length > 0 && (
        <Section title="Most failed questions" icon={<AlertTriangle className="size-4" />}>
          <div className="space-y-2">
            {(detail.mostFailedQuestions ?? []).map((q, rank) => (
              <div
                key={`${q.moduleId}-${q.questionIndex}`}
                className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-xs font-bold text-destructive">
                  {rank + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] text-muted-foreground">{q.moduleTitle}</p>
                  <p className="truncate text-sm font-medium" title={q.questionText}>
                    Q{q.questionIndex + 1}: {q.questionText}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-destructive tabular-nums">
                  {q.correctPercent.toFixed(0)}% correct
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Question-level breakdown" icon={<BarChart3 className="size-4" />}>
        {(detail.questionStats ?? []).length === 0 ? (
          <EmptyHint text="No per-question data yet — appears after learners submit quizzes." />
        ) : (
          <div className="space-y-2">
            {(detail.questionStats ?? []).map((q) => (
              <div
                key={`${q.moduleId}-${q.questionIndex}`}
                className="flex flex-col gap-2 rounded-lg border border-border/60 px-3 py-2.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{q.moduleTitle}</p>
                  <p className="truncate text-sm" title={q.questionText}>
                    Q{q.questionIndex + 1}: {q.questionText}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">{q.attemptCount} tries</span>
                  <div className="flex w-24 items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${q.correctPercent < 50 ? 'bg-destructive' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, q.correctPercent)}%` }}
                      />
                    </div>
                    <span
                      className={`w-8 text-right text-xs font-medium tabular-nums ${
                        q.correctPercent < 50 ? 'text-destructive' : ''
                      }`}
                    >
                      {q.correctPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <FeedbackEngagementSection
        feedback={detail.feedback}
        courseId={courseId}
        onRefresh={onRefresh}
      />
    </div>
  );
}

function DropOffCard({ label, point }: { label: string; point: import('../api/educatorAnalyticsApi').DropOffPoint }) {
  return (
    <div className="rounded-lg border border-[var(--chart-1)]/25 bg-[var(--chart-1)]/5 p-4">
      <Badge variant="secondary" className="mb-2 text-[0.65rem]">{label} drop-off</Badge>
      <p className="font-medium">{point.targetTitle}</p>
      {point.moduleTitle && (
        <p className="text-xs text-muted-foreground">{point.moduleTitle}</p>
      )}
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{point.summary}</p>
    </div>
  );
}

function CourseMaintenanceSection({
  detail,
  courseId,
  onRefresh,
}: {
  detail: EducatorCourseAnalyticsDetail;
  courseId: string;
  onRefresh: () => void;
}) {
  const hasAlerts =
    detail.contentExpired
    || (detail.stuckStudentCount ?? 0) > 0
    || (detail.openContentFlags?.length ?? 0) > 0;

  if (!hasAlerts) return null;

  return (
    <Section title="Maintenance alerts" icon={<AlertTriangle className="size-4" />}>
      <div className="space-y-3">
        {detail.contentExpired && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">Content freshness expired</p>
            <p className="mt-1 text-muted-foreground">
              You set content to expire
              {detail.contentExpiresAt
                ? ` on ${new Date(detail.contentExpiresAt).toLocaleDateString()}`
                : ''}
              . Update lessons or extend the date in the course editor.
            </p>
          </div>
        )}
        {(detail.stuckStudentCount ?? 0) > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
            <p className="font-medium">{detail.stuckStudentCount} stuck student{detail.stuckStudentCount === 1 ? '' : 's'}</p>
            <p className="mt-1 text-muted-foreground">
              Enrolled 14+ days with no activity in the last 7 days — consider outreach or content refresh.
            </p>
          </div>
        )}
        {(detail.openContentFlags?.length ?? 0) > 0 && (
          <ContentFlagsPanel
            flags={detail.openContentFlags ?? []}
            courseId={courseId}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </Section>
  );
}

function ContentFlagsPanel({
  flags,
  courseId,
  onRefresh,
}: {
  flags: ContentFlag[];
  courseId: string;
  onRefresh: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleResolve = async (flagId: string) => {
    setBusyId(flagId);
    try {
      await resolveContentFlag(courseId, flagId);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const handleDismiss = async (flagId: string) => {
    setBusyId(flagId);
    try {
      await dismissContentFlag(courseId, flagId);
      onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 p-4">
      <p className="mb-3 text-sm font-medium">Student outdated-content reports</p>
      <div className="space-y-3">
        {flags.map((flag) => (
          <div key={flag.id} className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[0.6rem]">Open</Badge>
              {flag.lessonTitle ? (
                <span className="font-medium">{flag.lessonTitle}</span>
              ) : (
                <span className="font-medium">Whole course</span>
              )}
              {flag.moduleTitle && (
                <span className="text-xs text-muted-foreground">{flag.moduleTitle}</span>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{flag.reason}</p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">
              {flag.reporterName ?? 'Learner'} · {flag.createdAt ? new Date(flag.createdAt).toLocaleDateString() : ''}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                disabled={busyId === flag.id}
                onClick={() => void handleResolve(flag.id)}
              >
                Mark resolved
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === flag.id}
                onClick={() => void handleDismiss(flag.id)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedbackEngagementSection({
  feedback,
  courseId,
  onRefresh,
}: {
  feedback: import('../api/educatorAnalyticsApi').CourseFeedbackAnalytics | null;
  courseId: string;
  onRefresh: () => void;
}) {
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

  if (!feedback) return null;

  const handleReply = async (commentId: string) => {
    const reply = (replyDrafts[commentId] ?? '').trim();
    if (reply.length < 2) return;
    setReplying(commentId);
    try {
      await replyToLearnerComment(courseId, commentId, reply);
      onRefresh();
    } catch {
      /* ignore */
    } finally {
      setReplying(null);
    }
  };

  return (
    <Section title="Feedback & engagement" icon={<MessageCircle className="size-4" />}>
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <MiniStat
          label="Avg rating"
          value={feedback.reviewCount > 0 ? `${feedback.avgRating.toFixed(1)} ★` : '—'}
          icon={<Star className="size-3.5" />}
        />
        <MiniStat label="Reviews" value={String(feedback.reviewCount)} icon={<Star className="size-3.5" />} />
        <MiniStat label="Comments" value={String(feedback.totalComments)} icon={<MessageCircle className="size-3.5" />} />
        <MiniStat
          label="Unanswered"
          value={String(feedback.unansweredCount)}
          icon={<AlertTriangle className="size-3.5" />}
          highlight={feedback.unansweredCount > 0}
        />
      </div>

      {feedback.recentReviews.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent reviews</p>
          <div className="space-y-2">
            {feedback.recentReviews.map((r) => (
              <div key={r.reviewId} className="rounded-lg border border-border/60 px-3 py-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{r.learnerName}</span>
                  <span className="text-[var(--chart-1)]">{'★'.repeat(r.rating)}</span>
                </div>
                {r.reviewText && <p className="mt-1 text-muted-foreground">{r.reviewText}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.unansweredQuestions.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Unanswered questions</p>
          <div className="space-y-3">
            {feedback.unansweredQuestions.map((q) => (
              <div key={q.commentId} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-xs text-muted-foreground">
                  {q.learnerName} · {q.moduleTitle} — {q.lessonTitle}
                </p>
                <p className="mt-1 text-sm">{q.body}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={replyDrafts[q.commentId] ?? ''}
                    onChange={(e) => setReplyDrafts((d) => ({ ...d, [q.commentId]: e.target.value }))}
                    placeholder="Write a reply…"
                    maxLength={2000}
                    className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                  />
                  <Button
                    size="sm"
                    disabled={replying === q.commentId}
                    onClick={() => void handleReply(q.commentId)}
                  >
                    {replying === q.commentId ? <Loader2 className="size-4 animate-spin" /> : 'Reply'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.lessonReactions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Thumbs per lesson</p>
          <div className="space-y-2">
            {feedback.lessonReactions.map((r) => (
              <div key={r.lessonId} className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.lessonTitle}</p>
                  <p className="text-xs text-muted-foreground">{r.moduleTitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-600"><ThumbsUp className="size-3.5" /> {r.thumbsUp}</span>
                  <span className="flex items-center gap-1 text-destructive"><ThumbsDown className="size-3.5" /> {r.thumbsDown}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.reviewCount === 0 && feedback.totalComments === 0 && feedback.lessonReactions.length === 0 && (
        <EmptyHint text="No learner feedback yet — reviews, comments, and reactions appear here." />
      )}
    </Section>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 border-b border-border/40 pb-2">
        <span className="text-[var(--chart-1)]">{icon}</span>
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 transition-colors ${
        highlight ? 'border-[var(--chart-1)]/25 bg-[var(--chart-1)]/5' : 'border-border bg-muted/20'
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="text-[0.65rem] font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-1 py-1.5">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">{text}</p>;
}

function DeviceIcon({ type }: { type: string }) {
  if (type === 'mobile') return <Smartphone className="size-3.5 text-muted-foreground" />;
  if (type === 'desktop') return <Monitor className="size-3.5 text-muted-foreground" />;
  return <Monitor className="size-3.5 text-muted-foreground opacity-50" />;
}

function HourActivityChart({ buckets }: { buckets: { hourOfDay: number; eventCount: number }[] }) {
  if (buckets.length === 0) {
    return <EmptyHint text="No activity recorded yet." />;
  }

  const peak = Math.max(1, ...buckets.map((b) => b.eventCount));
  const byHour = new Map(buckets.map((b) => [b.hourOfDay, b.eventCount]));
  const peakHour = buckets.reduce((best, b) => (b.eventCount > best.eventCount ? b : best), buckets[0]);

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Peak activity around <span className="font-medium text-foreground">{formatHour(peakHour.hourOfDay)}</span>
      </p>
      <div className="flex h-32 items-end gap-0.5">
        {Array.from({ length: 24 }, (_, hour) => {
          const count = byHour.get(hour) ?? 0;
          const height = count > 0 ? Math.max((count / peak) * 100, 10) : 3;
          const isPeak = hour === peakHour.hourOfDay && count > 0;
          return (
            <div
              key={hour}
              className="group relative flex min-w-0 flex-1 flex-col justify-end h-full"
              title={`${formatHour(hour)} — ${count} events`}
            >
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${height}%`,
                  background: isPeak
                    ? 'var(--chart-1)'
                    : count > 0
                      ? 'color-mix(in srgb, var(--chart-1) 45%, var(--muted))'
                      : 'var(--muted)',
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[0.65rem] text-muted-foreground">
        <span>12am</span>
        <span>12pm</span>
        <span>11pm</span>
      </div>
    </div>
  );
}

function formatWatchMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

function formatHour(h: number): string {
  if (h === 0) return '12am';
  if (h === 12) return '12pm';
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

function formatRelative(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
