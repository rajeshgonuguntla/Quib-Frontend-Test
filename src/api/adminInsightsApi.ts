import axios from 'axios';

import type { EnrollmentTrends } from './educatorAnalyticsApi';

export interface AdminPlatformOverview {
  publishedCourseCount: number;
  educatorCount: number;
  learnerEnrollmentCount: number;
  topicDemandGapCount: number;
  atRiskCourseCount: number;
}

export interface TopicDemandSupply {
  topic: string;
  demandCount: number;
  supplyCount: number;
  demandSupplyRatio: number;
  signal: 'demand_gap' | 'balanced' | 'oversupply' | string;
}

export interface CourseHealthInsight {
  courseId: string;
  title: string;
  category: string;
  educatorEmail: string | null;
  enrollmentCount: number;
  completionRate: number;
  signal: string;
}

export interface AdminInsightsDashboard {
  overview: AdminPlatformOverview;
  enrollmentTrends: EnrollmentTrends;
  topicDemandSupply: TopicDemandSupply[];
  atRiskCourses: CourseHealthInsight[];
}

export async function fetchAdminInsights(): Promise<AdminInsightsDashboard> {
  const { data } = await axios.get<AdminInsightsDashboard & { enrollmentTrend?: import('./educatorAnalyticsApi').EnrollmentTrendPoint[] }>(
    '/api/admin/insights',
  );
  const trends = data.enrollmentTrends ?? {
    daily: data.enrollmentTrend ?? [],
    weekly: [],
    monthly: [],
  };
  return { ...data, enrollmentTrends: trends };
}
