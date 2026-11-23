import courseJson from './mock/studio-course.sat-math-sprint.json';
import threadJson from './mock/studio-thread.sat-math-sprint.json';
import playlistJson from './mock/playlist.sat-math-sprint.json';
import myCoursesJson from '../courses/mock/my-courses.json';

export interface NotePoint {
  at: string;
  text: string;
  lessonTitle?: string;
}

export interface DrillQuestion {
  id: string;
  n: number;
  prompt: string;
  format: string;
  hard?: boolean;
}

export interface ItemContent {
  kind: string;
  duration?: string;
  notes?: NotePoint[];
  points?: NotePoint[];
  questions?: DrillQuestion[];
  moreCount?: number;
  cards?: { front: string; back: string }[];
  blanks?: { sentence: string; at?: string }[];
  totalQuestions?: number;
  minutes?: number;
  adaptive?: boolean;
  sections?: { name: string; questions: number; minutes: number }[];
}

export interface StudioItem {
  id: string;
  kind: string;
  moduleId: string;
  title: string;
  fullTitle?: string;
  meta: string;
  content: ItemContent;
}

export interface StudioModule {
  id: string;
  name: string;
  items: StudioItem[];
}

export interface StudioCourse {
  id: string;
  title: string;
  description: string;
  slug?: string;
  status: 'draft' | 'published';
  visibility: 'public' | 'private';
  modules: StudioModule[];
}

export interface ItemRef {
  id: string;
  label: string;
}

export interface DiffOp {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  summary: string;
  op: {
    type: string;
    questions?: DrillQuestion[];
    notes?: NotePoint[];
  };
}

export type StudioCard =
  | {
      type: 'summary';
      title: string;
      counts: {
        modules: number;
        lessons: number;
        drills: number;
        questions: number;
        decks: number;
        cards: number;
        blanks: number;
        mocks: number;
      };
    }
  | { type: 'diff'; title: string; ops: DiffOp[] }
  | {
      type: 'settings';
      title: string;
      description: string;
      slug?: string;
      visibility: 'public' | 'private';
      publish: boolean;
      show: Array<'title' | 'description' | 'slug' | 'access' | 'publish'>;
      status: 'pending' | 'confirmed' | 'cancelled';
    }
  | { type: 'source'; kind: 'playlist' | 'video' | 'web' | 'pdf'; url?: string; live?: boolean };

export interface StudioChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  refs?: ItemRef[];
  card?: StudioCard;
  /** One status line plus the hairline, while a request is in flight. */
  pending?: boolean;
}

export interface PlaylistVideo {
  id: string;
  title: string;
  duration: string;
  captions?: boolean;
  selected: boolean;
}

export const seededCourse = courseJson as unknown as StudioCourse;
export const seededMessages = threadJson as unknown as StudioChatMessage[];
export const playlist = playlistJson as {
  type: string;
  url: string;
  title: string;
  description: string;
  detectedLabel: string;
  videos: PlaylistVideo[];
};

export const myCourseRows = myCoursesJson.courses;
export const myCourseStats = myCoursesJson.stats.filter(
  (stat) => stat.label !== 'Active · Nov' && stat.label !== 'Video hours',
);

export function isSeededCourse(courseId?: string) {
  return courseId === 'sat-math-sprint' || courseId === 'sm';
}

/** Sample rows stay static. Any other id is a real course the backend can load. */
export function isLiveStudioCourse(courseId?: string) {
  if (!courseId || isSeededCourse(courseId)) return false;
  return !findCourseRow(courseId);
}

export function studioPath(courseId: string) {
  return courseId === 'sm' ? '/educator-studio/sat-math-sprint' : `/educator-studio/${courseId}`;
}

export function findCourseRow(courseId?: string) {
  if (!courseId) return undefined;
  return myCourseRows.find((row) => row.courseId === courseId || (courseId === 'sat-math-sprint' && row.courseId === 'sm'));
}

export type CourseFilter = 'all' | 'published' | 'draft';

export function courseCounts(removedId: string | null) {
  const live = myCourseRows.filter((row) => row.courseId !== removedId);
  return {
    all: live.length,
    published: live.filter((row) => row.status === 'published').length,
    draft: live.filter((row) => row.status === 'draft').length,
  };
}

export function visibleCourses(filter: CourseFilter, query: string, removedId: string | null) {
  const needle = query.trim().toLowerCase();
  return myCourseRows.filter((row) => {
    if (row.courseId === removedId) return false;
    if (filter !== 'all' && row.status !== filter) return false;
    if (needle && !row.title.toLowerCase().includes(needle)) return false;
    return true;
  });
}

export function detectLink(url: string): 'playlist' | 'video' | 'web' | 'pdf' | 'invalid' {
  const value = url.trim();
  if (/\.pdf($|\?)/i.test(value)) return 'pdf';
  if (/list=|playlist/i.test(value)) return 'playlist';
  if (/youtu\.be|youtube\.com/i.test(value)) return 'video';
  if (/^https?:\/\//i.test(value)) return 'web';
  return 'invalid';
}
