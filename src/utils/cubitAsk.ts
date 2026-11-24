import axios from 'axios';
import type { EnrollmentSummary } from '../types/catalog';
import { isYoutubePlaylistUrl, isYoutubeVideoUrl } from './youtubeUrl';

/** A Cubit-tab question is free text. Links still go through the course-start path. */
export function isCubitQuestion(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return false;
  return !isYoutubePlaylistUrl(trimmed) && !isYoutubeVideoUrl(trimmed);
}

/** Prefer the course the learner is already in. */
export function pickCubitAskCourse(enrollments: EnrollmentSummary[]): EnrollmentSummary | null {
  if (enrollments.length === 0) return null;
  return enrollments.find((row) => row.status === 'in-progress') ?? enrollments[0] ?? null;
}

export function cubitAskError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (err.response?.status === 403) {
      return data?.message || 'Start learning to use the course tutor.';
    }
    if (err.response?.status === 429) {
      return 'Too many messages. Please wait a moment and try again.';
    }
    return data?.message || 'Unable to reach Cubit.';
  }
  return 'Unable to reach Cubit.';
}
