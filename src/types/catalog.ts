export interface CatalogInterest {
  id: string;
  label: string;
  description: string;
  color: string;
  categories: string[];
}

export interface CatalogCreator {
  id: string;
  name: string;
  color: string;
  tagline: string;
  youtubeVideoId: string;
  category: string;
  bio: string;
  videoCount: number;
  popularRank?: number | null;
  courses?: CatalogFeaturedVideo[];
}

export interface CatalogFeaturedVideo {
  id: string;
  title: string;
  youtubeVideoId: string;
  durationLabel: string;
  viewsLabel: string;
}

export interface CatalogCourseSummary {
  courseId: string;
  title: string;
  description?: string;
  difficulty?: string;
  category: string;
  categoryColor?: string;
  channelName?: string;
  youtubeVideoId?: string;
  durationLabel?: string;
  moduleCount?: number;
  playlistUrl?: string;
  isPublished?: boolean;
}

export interface CourseSearchResult {
  courseId: string;
  title: string;
  channelName?: string;
  playlistUrl?: string;
  youtubeVideoId?: string;
  durationLabel?: string;
  category?: string;
  matchedOn?: 'creator' | 'playlist' | 'video' | 'title' | string;
}

export interface OnboardingState {
  interestIds: string[];
  followedCreatorIds: string[];
  completed: boolean;
}

export interface EnrollmentSummary {
  enrollmentId: string;
  courseId: string;
  title: string;
  channel: string;
  category: string;
  categoryColor?: string;
  youtubeVideoId?: string;
  status: 'saved' | 'in-progress' | 'completed' | string;
  progress: number;
  score?: number | null;
  lessonCount?: number;
  durationLabel?: string;
}

export interface EnrollmentStats {
  total: number;
  inProgress: number;
  saved: number;
  completed: number;
  avgScore: number;
}
