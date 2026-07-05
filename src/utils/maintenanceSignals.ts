import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  CalendarClock,
  Flag,
  HelpCircle,
  TrendingDown,
  Users,
  Video,
} from 'lucide-react';
import type { MaintenanceSignal } from '../api/educatorAnalyticsApi';

type SignalMeta = {
  label: string;
  icon: LucideIcon;
  hint: string;
};

const SIGNAL_META: Record<string, SignalMeta> = {
  high_video_dropoff: {
    label: 'Video drop-off',
    icon: Video,
    hint: 'Learners skip this video — consider re-recording or shortening it.',
  },
  high_module_dropoff: {
    label: 'Module drop-off',
    icon: TrendingDown,
    hint: 'Students leave the course at this module — review pacing and difficulty.',
  },
  low_quiz_scores: {
    label: 'Low quiz scores',
    icon: HelpCircle,
    hint: 'Quiz may be too hard or questions need clarification.',
  },
  stuck_students: {
    label: 'Stuck students',
    icon: Users,
    hint: 'Enrolled learners inactive 7+ days after 14 days enrolled.',
  },
  content_expired: {
    label: 'Content expired',
    icon: CalendarClock,
    hint: 'Update the course or extend the freshness date in the editor.',
  },
  student_content_report: {
    label: 'Student report',
    icon: Flag,
    hint: 'A learner flagged content as outdated.',
  },
  stale_enrollments: {
    label: 'No recent enrollments',
    icon: AlertTriangle,
    hint: 'No new learners in 30 days — consider promotion or refresh.',
  },
};

export function getMaintenanceSignalMeta(type: string): SignalMeta {
  return SIGNAL_META[type] ?? {
    label: type.replace(/_/g, ' '),
    icon: AlertTriangle,
    hint: 'Review this course in analytics.',
  };
}

export function maintenanceSignalSortPriority(signal: MaintenanceSignal): number {
  if (signal.severity === 'alert') return 0;
  return 1;
}
