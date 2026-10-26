import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import axios from 'axios';
import {
  fetchLessonComments,
  postLessonComment,
  reportContentFlag,
  setLessonReaction,
} from './courseFeedbackApi';

const mocked = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe('courseFeedbackApi lesson social', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.post.mockReset();
  });

  it('lists lesson comments', async () => {
    mocked.get.mockResolvedValue({ data: [{ id: '1', body: 'hi' }] });
    const list = await fetchLessonComments('c1', 'l1');
    expect(mocked.get).toHaveBeenCalledWith('/api/courses/c1/lessons/l1/comments');
    expect(list).toHaveLength(1);
  });

  it('posts comment, reaction, and content flag', async () => {
    mocked.post
      .mockResolvedValueOnce({ data: { id: 'c', body: 'q?' } })
      .mockResolvedValueOnce({ data: { value: 1, thumbsUp: 1, thumbsDown: 0 } })
      .mockResolvedValueOnce({ data: { id: 'f', reason: 'old clip' } });

    await postLessonComment('c1', 'l1', 'q?');
    await setLessonReaction('c1', 'l1', 1);
    await reportContentFlag('c1', 'old clip from 2012', 'l1');

    expect(mocked.post.mock.calls[0][0]).toBe('/api/courses/c1/lessons/l1/comments');
    expect(mocked.post.mock.calls[1][0]).toBe('/api/courses/c1/lessons/l1/reaction');
    expect(mocked.post.mock.calls[2][0]).toBe('/api/courses/c1/content-flags');
    expect(mocked.post.mock.calls[2][1]).toEqual({ reason: 'old clip from 2012', lessonId: 'l1' });
  });
});
