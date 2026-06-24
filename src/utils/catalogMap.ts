import type { CatalogCreator, CatalogCourseSummary } from '../types/catalog';
import type { Creator } from '../data/creators';

export function ytThumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function mapCatalogCreator(c: CatalogCreator): Creator {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    tagline: c.tagline,
    videoId: c.youtubeVideoId,
    category: c.category,
    bio: c.bio ?? '',
    videoCount: c.videoCount,
    courses: (c.courses ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      videoId: v.youtubeVideoId,
      duration: v.durationLabel,
      views: v.viewsLabel,
    })),
  };
}

export function creatorToCategoryCard(c: {
  id: string;
  name: string;
  tagline: string;
  videoCount: number;
  youtubeVideoId?: string;
  videoId?: string;
}) {
  const videoId = c.youtubeVideoId ?? c.videoId ?? '';
  return {
    id: c.id,
    name: c.name,
    sub: c.tagline,
    videos: c.videoCount,
    image: ytThumb(videoId),
  };
}

export function courseToCuratedCard(c: CatalogCourseSummary) {
  const instructor =
    c.educatorChannelTitle
    ?? c.ownerDisplayName
    ?? c.channelName
    ?? 'Educator';
  const instructorAvatar = c.educatorChannelThumbnail ?? c.ownerAvatarUrl;
  return {
    id: c.courseId,
    title: c.title,
    instructor,
    instructorAvatar,
    tag: c.category,
    language: c.contentLanguage,
    rating: '4.8',
    students: '—',
    duration: c.durationLabel ?? '—',
    image: c.youtubeVideoId ? ytThumb(c.youtubeVideoId) : '',
  };
}
