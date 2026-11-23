import axios, { type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCourse, updateCourse } from '../api/educatorApi';
import { sendEducatorAssistantMessage } from '../api/educatorAssistantApi';
import type { EditableCourse } from '../types/courseGeneration';
import {
  applyEditToCourseView,
  canEditCourseDetails,
  runCourseEditTurn,
  savedEditMessage,
  withKeptVideoIds,
} from './courseEditChat';

vi.mock('../api/educatorApi', () => ({
  fetchCourse: vi.fn(),
  updateCourse: vi.fn(),
}));

vi.mock('../api/educatorAssistantApi', () => ({
  sendEducatorAssistantMessage: vi.fn(),
}));

const base: EditableCourse = {
  title: 'Algebra',
  description: 'A short course.',
  difficulty: 'Intermediate',
  modules: [
    {
      id: 'm1',
      title: 'Lines',
      description: 'Slope.',
      lessons: [{ id: 'l1', title: 'Slope', duration: '8 min', type: 'video' }],
      quiz: [],
    },
    {
      id: 'm2',
      title: 'Quadratics',
      description: 'Parabolas.',
      lessons: [{ id: 'l2', title: 'Factoring', duration: '9 min', type: 'video' }],
      quiz: [],
    },
  ],
  playlistVideos: [{ videoId: 'vid-1', videoUrl: 'https://youtu.be/vid-1', title: 'Slope', duration: '8 min', playlistIndex: 0 }],
};

function serverError(status: number, message: string) {
  const err = new axios.AxiosError('fail');
  err.response = { status, data: { message } } as AxiosResponse;
  return err;
}

describe('course details edit chat', () => {
  beforeEach(() => {
    vi.mocked(fetchCourse).mockReset();
    vi.mocked(updateCourse).mockReset();
    vi.mocked(sendEducatorAssistantMessage).mockReset();
  });

  it('shows the chat only to an owner who is an educator or admin', () => {
    expect(canEditCourseDetails(true, 'educator')).toBe(true);
    expect(canEditCourseDetails(true, 'admin')).toBe(true);
    expect(canEditCourseDetails(true, 'learner')).toBe(false);
    expect(canEditCourseDetails(false, 'educator')).toBe(false);
    expect(canEditCourseDetails(false, undefined)).toBe(false);
  });

  it('saves an assistant edit and confirms only after the course is stored', async () => {
    const renamed = {
      ...base,
      modules: [
        base.modules[0],
        { ...base.modules[1], title: 'Quadratic functions' },
      ],
    };
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Renamed module 2.',
      hasCourseChanges: true,
      courseUpdate: renamed,
      sessionId: 'sess-1',
      courseRevision: 'rev-2',
    });
    vi.mocked(updateCourse).mockResolvedValue({});
    vi.mocked(fetchCourse).mockResolvedValue(renamed);

    const turn = await runCourseEditTurn({
      courseId: 'course-1',
      base,
      message: 'rename module 2',
    });

    expect(updateCourse).toHaveBeenCalledWith('course-1', expect.objectContaining({
      title: 'Algebra',
      includedVideoIds: ['vid-1'],
      modules: [
        expect.objectContaining({ title: 'Lines' }),
        expect.objectContaining({ title: 'Quadratic functions' }),
      ],
    }));
    expect(turn.ok).toBe(true);
    if (!turn.ok || !turn.changed) throw new Error('expected a saved edit');
    expect(turn.text).toContain('Renamed module 2.');
    expect(turn.text).toContain('Saved.');
    expect(turn.text).toContain('Quadratic functions');
    expect(turn.course.modules[1].title).toBe('Quadratic functions');
    expect(turn.sessionId).toBe('sess-1');
    expect(applyEditToCourseView({ ...base, date: '4/18/2026' }, turn.course).modules[1].title).toBe('Quadratic functions');
  });

  it('does not save or confirm when the assistant fails', async () => {
    vi.mocked(sendEducatorAssistantMessage).mockRejectedValue(serverError(500, 'Assistant unavailable'));

    const turn = await runCourseEditTurn({ courseId: 'course-1', base, message: 'rename module 2' });

    expect(updateCourse).not.toHaveBeenCalled();
    expect(turn).toEqual({ ok: false, text: 'Assistant unavailable' });
    expect(turn.ok ? '' : turn.text).not.toMatch(/Saved/);
  });

  it('reports a save failure and leaves the course unchanged', async () => {
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Renamed module 2.',
      hasCourseChanges: true,
      courseUpdate: {
        ...base,
        modules: [base.modules[0], { ...base.modules[1], title: 'Quadratic functions' }],
      },
    });
    vi.mocked(updateCourse).mockRejectedValue(serverError(409, 'Course was updated elsewhere'));

    const turn = await runCourseEditTurn({ courseId: 'course-1', base, message: 'rename module 2' });

    expect(fetchCourse).not.toHaveBeenCalled();
    expect(turn.ok).toBe(false);
    if (turn.ok) throw new Error('expected a failed save');
    expect(turn.text).toBe('Course was updated elsewhere');
    expect(turn.text).not.toMatch(/Saved/);
  });

  it('returns the reply without saving when nothing changed', async () => {
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Which module should I rename?',
      hasCourseChanges: false,
      courseUpdate: null,
    });

    const turn = await runCourseEditTurn({ courseId: 'course-1', base, message: 'rename it' });

    expect(updateCourse).not.toHaveBeenCalled();
    expect(turn).toMatchObject({ ok: true, changed: false, text: 'Which module should I rename?' });
  });

  it('keeps the saved payload when the reload fails', async () => {
    const renamed = {
      ...base,
      description: 'Shorter.',
    };
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Shortened the description.',
      hasCourseChanges: true,
      courseUpdate: renamed,
    });
    vi.mocked(updateCourse).mockResolvedValue({});
    vi.mocked(fetchCourse).mockRejectedValue(serverError(503, 'Try again'));

    const turn = await runCourseEditTurn({ courseId: 'course-1', base, message: 'rewrite the description shorter' });

    expect(turn.ok && turn.changed && turn.course.description).toBe('Shorter.');
    expect(turn.ok && turn.text.startsWith('Shortened the description.')).toBe(true);
    expect(turn.ok && turn.text).toContain('Saved.');
  });

  it('keeps playlist video ids when the assistant omits them', () => {
    const payload = withKeptVideoIds(base, { ...base, includedVideoIds: [] });
    expect(payload.includedVideoIds).toEqual(['vid-1']);
    expect(savedEditMessage('', base, { ...base, title: 'Algebra sprint' })).toContain('Saved.');
  });
});
