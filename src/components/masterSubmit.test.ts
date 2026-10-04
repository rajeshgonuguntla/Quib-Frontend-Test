import { describe, expect, it } from 'vitest';
import { resolveMasterSubmit } from './masterSubmit';

const video = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const playlist = 'https://www.youtube.com/playlist?list=PLtest123';

describe('resolveMasterSubmit', () => {
  it('blocks an empty ask', () => {
    expect(resolveMasterSubmit({
      value: '   ',
      mode: 'course',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({ type: 'blocked' });
  });

  it('opens a conversation for a free-text question', () => {
    expect(resolveMasterSubmit({
      value: ' How does Python handle lists? ',
      mode: 'course',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({ type: 'ask', text: 'How does Python handle lists?' });
  });

  it('keeps the YouTube error when questions are disabled', () => {
    const result = resolveMasterSubmit({
      value: 'How does Python handle lists?',
      mode: 'course',
      examType: 'custom',
      signedIn: true,
    });
    expect(result.type).toBe('error');
  });

  it('sends a signed-in video URL to the course builder', () => {
    expect(resolveMasterSubmit({
      value: video,
      mode: 'course',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({
      type: 'navigate',
      path: '/course-builder',
      state: { youtubeUrl: video, startTool: 'course' },
    });
  });

  it('sends a playlist URL to the course builder with the same start tool', () => {
    expect(resolveMasterSubmit({
      value: playlist,
      mode: 'notes',
      examType: 'custom',
      signedIn: true,
    })).toEqual({
      type: 'navigate',
      path: '/course-builder',
      state: { youtubeUrl: playlist, startTool: 'notes' },
    });
  });

  it('sends signed-out course links to sign in', () => {
    expect(resolveMasterSubmit({
      value: playlist,
      mode: 'course',
      examType: 'custom',
      signedIn: false,
    })).toEqual({
      type: 'navigate',
      path: '/signin',
      state: { playlistUrl: playlist, startTool: 'course' },
    });
  });

  it('keeps sample-test prompts on the quiz setup path', () => {
    expect(resolveMasterSubmit({
      value: 'SAT math linear equations practice',
      mode: 'quiz',
      examType: 'sat',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({
      type: 'navigate',
      path: '/quiz-setup',
      state: { prompt: 'SAT math linear equations practice', examType: 'sat', startTool: 'quiz' },
    });
  });

  it('rejects a sample-test prompt that is too short', () => {
    expect(resolveMasterSubmit({
      value: 'SAT',
      mode: 'quiz',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({
      type: 'error',
      message: 'Describe what you want to be tested on (or paste a YouTube URL).',
    });
  });

  it('sends a GRE request from Start learning to GRE quiz setup', () => {
    expect(resolveMasterSubmit({
      value: 'generate a gre test',
      mode: 'course',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({
      type: 'navigate',
      path: '/quiz-setup',
      state: { prompt: 'generate a gre test', examType: 'gre', startTool: 'quiz' },
    });
  });

  it('keeps a general GRE question in the conversation', () => {
    expect(resolveMasterSubmit({
      value: 'What is the GRE?',
      mode: 'course',
      examType: 'custom',
      signedIn: true,
      questionsEnabled: true,
    })).toEqual({ type: 'ask', text: 'What is the GRE?' });
  });

  it('uses GRE when the prompt names it and the chip is still Custom', () => {
    expect(resolveMasterSubmit({
      value: 'generate a GRE test',
      mode: 'quiz',
      examType: 'custom',
      signedIn: true,
    })).toEqual({
      type: 'navigate',
      path: '/quiz-setup',
      state: { prompt: 'generate a GRE test', examType: 'gre', startTool: 'quiz' },
    });
  });

  it('keeps the GRE chip when the prompt does not name another exam', () => {
    expect(resolveMasterSubmit({
      value: 'verbal analogies practice',
      mode: 'quiz',
      examType: 'gre',
      signedIn: true,
    })).toEqual({
      type: 'navigate',
      path: '/quiz-setup',
      state: { prompt: 'verbal analogies practice', examType: 'gre', startTool: 'quiz' },
    });
  });

  it('routes quiz videos and playlists to their existing setup pages', () => {
    expect(resolveMasterSubmit({
      value: video,
      mode: 'quiz',
      examType: 'gre',
      signedIn: true,
    })).toMatchObject({ type: 'navigate', path: '/quiz-setup' });

    expect(resolveMasterSubmit({
      value: playlist,
      mode: 'quiz',
      examType: 'gre',
      signedIn: true,
    })).toEqual({
      type: 'navigate',
      path: '/playlist-setup/new',
      state: { playlistUrl: playlist },
    });
  });
});
