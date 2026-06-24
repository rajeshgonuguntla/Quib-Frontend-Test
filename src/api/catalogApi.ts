import axios from 'axios';
import type {
  CatalogCourseSummary,
  CatalogCreator,
  CatalogInterest,
  CourseSearchResult,
  EnrollmentStats,
  EnrollmentSummary,
  OnboardingState,
} from '../types/catalog';

export async function fetchInterests(): Promise<CatalogInterest[]> {
  const res = await axios.get<CatalogInterest[]>('/api/catalog/interests');
  return res.data ?? [];
}

export async function fetchCreators(category?: string): Promise<CatalogCreator[]> {
  const res = await axios.get<CatalogCreator[]>('/api/catalog/creators', {
    params: category ? { category } : undefined,
  });
  return res.data ?? [];
}

export async function fetchPopularCreators(): Promise<CatalogCreator[]> {
  const res = await axios.get<CatalogCreator[]>('/api/catalog/creators/popular');
  return res.data ?? [];
}

export async function fetchCreator(creatorId: string): Promise<CatalogCreator> {
  const res = await axios.get<CatalogCreator>(`/api/catalog/creators/${creatorId}`);
  return res.data;
}

export async function fetchCourses(params: {
  category?: string;
  interestId?: string;
  interestIds?: string[];
  language?: string;
  limit?: number;
}): Promise<CatalogCourseSummary[]> {
  const res = await axios.get<CatalogCourseSummary[]>('/api/catalog/courses', { params });
  return res.data ?? [];
}

export async function fetchOnboarding(): Promise<OnboardingState> {
  const res = await axios.get<OnboardingState>('/api/users/me/onboarding');
  return res.data;
}

export async function saveOnboarding(state: OnboardingState): Promise<OnboardingState> {
  const res = await axios.put<OnboardingState>('/api/users/me/onboarding', state);
  return res.data;
}

export async function fetchFollowedCreators(): Promise<CatalogCreator[]> {
  const res = await axios.get<CatalogCreator[]>('/api/users/me/followed-creators');
  return res.data ?? [];
}

export async function fetchEnrollments(): Promise<EnrollmentSummary[]> {
  const res = await axios.get<EnrollmentSummary[]>('/api/users/me/enrollments');
  return res.data ?? [];
}

export async function fetchEnrollmentStats(): Promise<EnrollmentStats> {
  const res = await axios.get<EnrollmentStats>('/api/users/me/enrollments/stats');
  return res.data;
}

export async function searchCourses(query: string, limit = 20): Promise<CourseSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const res = await axios.get<CourseSearchResult[]>('/api/catalog/search', {
    params: { q: trimmed, limit },
  });
  return res.data ?? [];
}

export async function publishCourse(courseId: string) {
  const res = await axios.post(`/api/courses/${courseId}/publish`);
  return res.data;
}

export async function unpublishCourse(courseId: string) {
  const res = await axios.post(`/api/courses/${courseId}/unpublish`);
  return res.data;
}

export async function deleteCourse(courseId: string) {
  await axios.delete(`/api/courses/${courseId}`);
}
