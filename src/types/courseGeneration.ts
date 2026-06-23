export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseGenerationOptions = {
  moduleCount: number;
  difficulty: CourseDifficulty;
  questionsPerModule: number;
};

export const DEFAULT_GENERATION_OPTIONS: CourseGenerationOptions = {
  moduleCount: 4,
  difficulty: 'Intermediate',
  questionsPerModule: 3,
};

export type OwnedCourseSummary = {
  courseId: string;
  title: string;
  description?: string;
  difficulty?: string;
  category?: string;
  channelName?: string;
  youtubeVideoId?: string;
  published: boolean;
  moduleCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CourseQuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export type CourseLesson = {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading';
  videoId?: string;
  videoUrl?: string;
  summary?: string;
  keyConcepts?: string[];
  takeaway?: string;
  notes?: string;
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
  quiz: CourseQuizQuestion[];
};

export type EditableCourse = {
  title: string;
  description: string;
  difficulty: string;
  category?: string;
  modules: CourseModule[];
};

export type CourseUpdatePayload = EditableCourse;

export function isModuleQuizPassing(score: number, total: number): boolean {
  if (total <= 0) return false;
  return Math.round((score * 100) / total) >= 70;
}
