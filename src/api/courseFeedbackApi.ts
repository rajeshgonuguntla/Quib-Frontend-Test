import axios from 'axios';

export interface CourseReview {
  rating: number;
  reviewText: string | null;
  updatedAt: string;
}

export async function submitCourseReview(
  courseId: string,
  rating: number,
  reviewText?: string,
): Promise<CourseReview> {
  const { data } = await axios.post<CourseReview>(`/api/courses/${courseId}/reviews`, {
    rating,
    reviewText: reviewText ?? null,
  });
  return data;
}

export async function fetchMyCourseReview(courseId: string): Promise<CourseReview | null> {
  const { data } = await axios.get<CourseReview | null>(`/api/courses/${courseId}/reviews/mine`);
  return data;
}

export async function replyToLearnerComment(
  courseId: string,
  commentId: string,
  reply: string,
): Promise<void> {
  await axios.post(
    `/api/educator/analytics/courses/${courseId}/comments/${commentId}/reply`,
    { reply },
  );
}
