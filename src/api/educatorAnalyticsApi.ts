import axios from 'axios';

export interface EducatorAnalyticsOverview {
  totalEnrollments: number;
  avgCompletionRate: number;
  publishedCourses: number;
  draftCourses: number;
  totalWatchMinutes: number;
}

export interface EnrollmentTrendPoint {
  date: string;
  count: number;
}

export interface EducatorCourseMetrics {
  courseId: string;
  title: string;
  published: boolean;
  enrollmentCount: number;
  completionRate: number;
  avgDaysToComplete: number | null;
  lastEnrollmentAt: string | null;
}

export interface MaintenanceSignal {
  type: string;
  courseId: string;
  courseTitle: string;
  message: string;
  severity: 'warning' | 'alert' | string;
}

export interface EducatorAnalyticsDashboard {
  overview: EducatorAnalyticsOverview;
  enrollmentTrend: EnrollmentTrendPoint[];
  courses: EducatorCourseMetrics[];
  maintenanceSignals: MaintenanceSignal[];
}

export interface ModuleFunnelStep {
  moduleId: string;
  moduleTitle: string;
  sortOrder: number;
  reachedCount: number;
  enrolledCount: number;
  reachPercent: number;
}

export interface ModuleQuizAnalytics {
  moduleId: string;
  moduleTitle: string;
  attemptCount: number;
  uniqueStudents: number;
  avgScorePercent: number;
  passRate: number;
  retakeRate: number;
  lowScoreFlag: boolean;
}

export interface LessonVideoAnalytics {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  viewCount: number;
  avgWatchPercent: number;
  rewatchCount: number;
  rewatchRate: number;
  skippedCount: number;
}

export interface DropOffPoint {
  type: string;
  targetId: string;
  targetTitle: string;
  moduleTitle?: string;
  dropPercent: number;
  studentsLost: number;
  summary: string;
}

export interface CourseReviewSummary {
  reviewId: string;
  rating: number;
  reviewText: string | null;
  learnerName: string;
  createdAt: string;
}

export interface UnansweredQuestion {
  commentId: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  learnerName: string;
  body: string;
  createdAt: string;
}

export interface LessonReactionSummary {
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  thumbsUp: number;
  thumbsDown: number;
}

export interface CourseFeedbackAnalytics {
  avgRating: number;
  reviewCount: number;
  recentReviews: CourseReviewSummary[];
  totalComments: number;
  unansweredCount: number;
  unansweredQuestions: UnansweredQuestion[];
  lessonReactions: LessonReactionSummary[];
}

export interface ActivityHourBucket {
  hourOfDay: number;
  eventCount: number;
}

export interface DeviceBreakdown {
  deviceType: string;
  eventCount: number;
}

export interface QuizQuestionAnalytics {
  moduleId: string;
  moduleTitle: string;
  questionIndex: number;
  questionText: string;
  attemptCount: number;
  correctPercent: number;
}

export interface EducatorCourseAnalyticsDetail {
  courseId: string;
  title: string;
  published: boolean;
  enrollmentCount: number;
  completionRate: number;
  activeStudents7d: number;
  activeStudents30d: number;
  avgDaysToComplete: number | null;
  enrollmentTrend: EnrollmentTrendPoint[];
  moduleFunnel: ModuleFunnelStep[];
  quizStats: ModuleQuizAnalytics[];
  lessonVideos: LessonVideoAnalytics[];
  activityByHour: ActivityHourBucket[];
  deviceBreakdown: DeviceBreakdown[];
  questionStats: QuizQuestionAnalytics[];
  mostFailedQuestions: QuizQuestionAnalytics[];
  moduleDropOff: DropOffPoint | null;
  videoDropOff: DropOffPoint | null;
  feedback: CourseFeedbackAnalytics | null;
}

export async function fetchEducatorAnalyticsDashboard(): Promise<EducatorAnalyticsDashboard> {
  const { data } = await axios.get<EducatorAnalyticsDashboard>('/api/educator/analytics/dashboard');
  return data;
}

export async function fetchEducatorCourseAnalytics(courseId: string): Promise<EducatorCourseAnalyticsDetail> {
  const { data } = await axios.get<EducatorCourseAnalyticsDetail>(
    `/api/educator/analytics/courses/${courseId}`,
  );
  return data;
}
