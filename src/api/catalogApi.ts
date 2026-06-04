import axios from 'axios';
import type {
  CatalogCourseSummary,
  CatalogCreator,
  CatalogInterest,
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
