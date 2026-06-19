import axios from 'axios';

export interface YoutubeConnectionStatus {
  connected: boolean;
  channelId?: string;
  channelTitle?: string;
  channelThumbnailUrl?: string;
}

export interface EducatorYoutubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  durationLabel?: string;
  publishedAt?: string;
  watchUrl: string;
}

export async function fetchYoutubeStatus(): Promise<YoutubeConnectionStatus> {
  const { data } = await axios.get<YoutubeConnectionStatus>('/api/educator/youtube/status');
  return data;
}

export async function connectYoutubeChannel(payload: {
  code: string;
  redirectUri: string;
}): Promise<YoutubeConnectionStatus> {
  const { data } = await axios.post<YoutubeConnectionStatus>('/api/educator/youtube/connect', payload);
  return data;
}

export async function fetchYoutubeVideos(): Promise<EducatorYoutubeVideo[]> {
  const { data } = await axios.get<EducatorYoutubeVideo[]>('/api/educator/youtube/videos');
  return data;
}

export async function disconnectYoutubeChannel(): Promise<void> {
  await axios.delete('/api/educator/youtube/disconnect');
}

export async function generateCourseFromVideos(videoUrls: string[]) {
  const { data } = await axios.post('/api/course/generate-from-videos', { videoUrls });
  return data;
}
