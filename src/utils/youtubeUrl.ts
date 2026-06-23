/** Returns true when the URL looks like a YouTube playlist (has list=). */
export function isYoutubePlaylistUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (!host.includes('youtube.com') && host !== 'youtu.be') return false;
    return !!parsed.searchParams.get('list');
  } catch {
    return false;
  }
}

/** Returns true when the URL looks like a single YouTube video. */
export function isYoutubeVideoUrl(value: string): boolean {
  try {
    const trimmed = value.trim();
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return parsed.pathname.length > 1;
    }
    if (host.includes('youtube.com')) {
      return !!parsed.searchParams.get('v');
    }
    return false;
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(value.trim());
  }
}

export function getYoutubeUrlValidationError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Paste a YouTube video or playlist URL.';
  if (isYoutubePlaylistUrl(trimmed) || isYoutubeVideoUrl(trimmed)) return null;
  return 'Enter a valid YouTube video URL (watch?v=…) or playlist URL (list=…).';
}

/** Navigation state for course generation from Educator flows. */
export function courseGenStateFromYoutubeUrl(url: string, from: string) {
  const trimmed = url.trim();
  if (isYoutubePlaylistUrl(trimmed)) {
    return { youtubeUrl: trimmed, from };
  }
  if (isYoutubeVideoUrl(trimmed)) {
    const videoUrl = trimmed.match(/^[a-zA-Z0-9_-]{11}$/)
      ? `https://www.youtube.com/watch?v=${trimmed}`
      : trimmed;
    return { videoUrls: [videoUrl], from };
  }
  return null;
}
