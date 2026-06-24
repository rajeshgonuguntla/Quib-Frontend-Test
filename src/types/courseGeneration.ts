export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseStructure =
  | 'standard'
  | 'bootcamp'
  | 'exam_prep'
  | 'overview_deep_dive';

export type ContentLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'ja'
  | 'hi'
  | 'zh'
  | 'ar'
  | 'ko';

export type CourseGenerationOptions = {
  moduleCount: number;
  difficulty: CourseDifficulty;
  questionsPerModule: number;
  courseStructure: CourseStructure;
  contentLanguage: ContentLanguage;
};

export const DEFAULT_GENERATION_OPTIONS: CourseGenerationOptions = {
  moduleCount: 4,
  difficulty: 'Intermediate',
  questionsPerModule: 3,
  courseStructure: 'standard',
  contentLanguage: 'en',
};

export const COURSE_STRUCTURES: { value: CourseStructure; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Balanced progression across modules' },
  { value: 'bootcamp', label: 'Bootcamp', description: 'Intensive, hands-on ramp-up' },
  { value: 'exam_prep', label: 'Exam prep', description: 'Certification-style quizzes and traps' },
  { value: 'overview_deep_dive', label: 'Overview → deep dive', description: 'Survey first, then depth' },
];

export const CONTENT_LANGUAGES: { value: ContentLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ko', label: 'Korean' },
];

export const COURSE_CATEGORIES = [
  'AI / Machine Learning',
  'Programming',
  'Mathematics',
  'Web Development',
  'Biology',
  'General',
] as const;

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

export type PlaylistVideo = {
  videoId: string;
  videoUrl: string;
  title: string;
  duration: string;
  playlistIndex: number;
};

export type EditableCourse = {
  title: string;
  description: string;
  difficulty: string;
  category?: string;
  contentLanguage?: string;
  modules: CourseModule[];
  playlistVideos?: PlaylistVideo[];
};

export type CourseUpdatePayload = EditableCourse & {
  includedVideoIds?: string[];
};

export function isModuleQuizPassing(score: number, total: number): boolean {
  if (total <= 0) return false;
  return Math.round((score * 100) / total) >= 70;
}

export function nextModuleId(modules: CourseModule[]): string {
  const nums = modules
    .map((m) => /^m(\d+)$/.exec(m.id)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : modules.length + 1;
  return `m${next}`;
}

export function nextLessonId(modules: CourseModule[]): string {
  const all = modules.flatMap((m) => m.lessons);
  const nums = all
    .map((l) => /^l(\d+)$/.exec(l.id)?.[1])
    .filter(Boolean)
    .map((n) => Number(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : all.length + 1;
  return `l${next}`;
}
