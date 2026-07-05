import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Loader2,
  Scale,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  fetchAdminInsights,
  type AdminInsightsDashboard,
  type CourseHealthInsight,
  type TopicDemandSupply,
} from '../api/adminInsightsApi';
import { PageHeader } from '../shell/PageHeader';
import { useRequireAdmin } from '../hooks/useRequireAdmin';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { EnrollmentTrendPanel } from './analytics/EnrollmentTrendPanel';

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

function topicSignalBadge(signal: string) {
  switch (signal) {
    case 'demand_gap':
      return <Badge variant="destructive" className="text-[0.65rem]">Demand gap</Badge>;
    case 'oversupply':
      return <Badge variant="secondary" className="text-[0.65rem]">Oversupply</Badge>;
    default:
      return <Badge variant="outline" className="text-[0.65rem]">Balanced</Badge>;
  }
}

export function AdminInsights() {
  useRequireAdmin();
  const [dashboard, setDashboard] = useState<AdminInsightsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminInsights();
        if (mounted) setDashboard(data);
      } catch {
        if (mounted) {
          setDashboard(null);
          setError('Could not load platform insights. Admin access required.');
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

  const demandGaps = useMemo(
    () => (dashboard?.topicDemandSupply ?? []).filter((t) => t.signal === 'demand_gap'),
    [dashboard],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Loading platform insights…
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="py-16 text-center">
        <Shield className="mx-auto mb-3 size-9 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error ?? 'Insights unavailable.'}</p>
      </div>
    );
  }

  const { overview } = dashboard;

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Platform insights"
        description="Demand vs supply by topic and courses with high enrollment but weak completion — admin only."
      />

      <motion.div {...fadeUp} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={<BookOpen className="size-4" />} label="Published courses" value={String(overview.publishedCourseCount)} />
        <StatCard icon={<GraduationCap className="size-4" />} label="Educators" value={String(overview.educatorCount)} />
        <StatCard icon={<Users className="size-4" />} label="Learner enrollments" value={String(overview.learnerEnrollmentCount)} />
        <StatCard icon={<Scale className="size-4" />} label="Demand gaps" value={String(overview.topicDemandGapCount)} warn={overview.topicDemandGapCount > 0} />
        <StatCard icon={<TrendingDown className="size-4" />} label="At-risk courses" value={String(overview.atRiskCourseCount)} warn={overview.atRiskCourseCount > 0} />
      </motion.div>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.04 }}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-[var(--chart-1)]" />
                <CardTitle className="text-base">Platform enrollment trend</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[0.65rem] font-normal">Daily · weekly · monthly</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <EnrollmentTrendPanel trends={dashboard.enrollmentTrends} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.05 }} className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-[var(--chart-1)]" />
                <CardTitle className="text-base">Topic demand vs supply</CardTitle>
              </div>
              {demandGaps.length > 0 && (
                <Badge variant="destructive" className="text-[0.65rem]">{demandGaps.length} gaps</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {dashboard.topicDemandSupply.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No interest or category data yet.</p>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/80 text-left text-[0.65rem] uppercase tracking-wide text-muted-foreground backdrop-blur">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Topic</th>
                      <th className="px-3 py-2.5 font-medium">Demand</th>
                      <th className="px-3 py-2.5 font-medium">Supply</th>
                      <th className="px-4 py-2.5 font-medium">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.topicDemandSupply.map((row) => (
                      <TopicRow key={row.topic} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-[var(--chart-1)]" />
              <CardTitle className="text-base">High enrollment · low completion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {dashboard.atRiskCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No published courses with ≥5 enrollments and &lt;40% completion.
              </p>
            ) : (
              dashboard.atRiskCourses.map((course) => (
                <AtRiskCourseCard key={course.courseId} course={course} />
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  warn,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <Card className={warn ? 'border-destructive/30 bg-destructive/5' : undefined}>
      <CardContent className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TopicRow({ row }: { row: TopicDemandSupply }) {
  const highlight = row.signal === 'demand_gap';
  return (
    <tr className={highlight ? 'bg-destructive/5' : 'border-t border-border/40'}>
      <td className="px-4 py-3 font-medium">{row.topic}</td>
      <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.demandCount}</td>
      <td className="px-3 py-3 tabular-nums text-muted-foreground">{row.supplyCount}</td>
      <td className="px-4 py-3">{topicSignalBadge(row.signal)}</td>
    </tr>
  );
}

function AtRiskCourseCard({ course }: { course: CourseHealthInsight }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{course.title}</p>
          <p className="text-xs text-muted-foreground">{course.category}</p>
        </div>
        <Badge variant="destructive" className="shrink-0 text-[0.6rem]">At risk</Badge>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span><strong className="text-foreground">{course.enrollmentCount}</strong> enrollments</span>
        <span><strong className="text-foreground">{course.completionRate.toFixed(0)}%</strong> completion</span>
        {course.educatorEmail && <span>Educator {course.educatorEmail}</span>}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-destructive/70"
          style={{ width: `${Math.min(100, course.completionRate)}%` }}
        />
      </div>
    </div>
  );
}
