import {
  getYoutubeUrlValidationError,
  isYoutubePlaylistUrl,
  isYoutubeVideoUrl,
} from '../utils/youtubeUrl';

export type MasterStartMode = 'course' | 'notes' | 'flashcards' | 'blanks' | 'quiz';
export type MasterExamType = 'custom' | 'sat' | 'gre';

export type MasterSubmitResult =
  | { type: 'blocked' }
  | { type: 'error'; message: string }
  | { type: 'ask'; text: string }
  | { type: 'navigate'; path: string; state: Record<string, string> };

const QUIZ_TOO_SHORT = 'Describe what you want to be tested on (or paste a YouTube URL).';

/**
 * Decide what the dashboard ask bar should do with the current value.
 * YouTube links and sample-test prompts keep their existing navigation.
 * Other text can open an in-page conversation when questions are enabled.
 */
export function resolveMasterSubmit(input: {
  value: string;
  mode: MasterStartMode;
  examType: MasterExamType;
  signedIn: boolean;
  questionsEnabled?: boolean;
}): MasterSubmitResult {
  const trimmed = input.value.trim();
  const { mode, examType, signedIn } = input;

  if (!trimmed) return { type: 'blocked' };

  if (mode === 'quiz') {
    const playlist = isYoutubePlaylistUrl(trimmed);
    const video = isYoutubeVideoUrl(trimmed);
    if (playlist || video) {
      if (!signedIn) {
        return {
          type: 'navigate',
          path: '/signin',
          state: playlist
            ? { playlistUrl: trimmed, startTool: mode }
            : { youtubeUrl: trimmed, startTool: mode },
        };
      }
      if (playlist) {
        return { type: 'navigate', path: '/playlist-setup/new', state: { playlistUrl: trimmed } };
      }
      return { type: 'navigate', path: '/quiz-setup', state: { youtubeUrl: trimmed } };
    }

    if (trimmed.length < 8) {
      return { type: 'error', message: QUIZ_TOO_SHORT };
    }

    const state = { prompt: trimmed, examType, startTool: 'quiz' };
    if (!signedIn) return { type: 'navigate', path: '/signin', state };
    return { type: 'navigate', path: '/quiz-setup', state };
  }

  if (!getYoutubeUrlValidationError(trimmed)) {
    const playlist = isYoutubePlaylistUrl(trimmed);
    if (!signedIn) {
      return {
        type: 'navigate',
        path: '/signin',
        state: playlist
          ? { playlistUrl: trimmed, startTool: mode }
          : { youtubeUrl: trimmed, startTool: mode },
      };
    }
    return {
      type: 'navigate',
      path: '/course-builder',
      state: { youtubeUrl: trimmed, startTool: mode },
    };
  }

  if (input.questionsEnabled) {
    return { type: 'ask', text: trimmed };
  }

  return { type: 'error', message: getYoutubeUrlValidationError(trimmed) ?? 'Enter a valid YouTube video URL (watch?v=…) or playlist URL (list=…).' };
}
