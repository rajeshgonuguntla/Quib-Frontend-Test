import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCourse, updateCourse } from '../api/educatorApi';
import { sendEducatorAssistantMessage } from '../api/educatorAssistantApi';
import type { EditableCourse } from '../types/courseGeneration';
import { CourseEditChatDock } from './CourseEditChatDock';

vi.mock('../api/educatorApi', () => ({
  fetchCourse: vi.fn(),
  updateCourse: vi.fn(),
}));

vi.mock('../api/educatorAssistantApi', () => ({
  sendEducatorAssistantMessage: vi.fn(),
}));

const course: EditableCourse = {
  title: 'Algebra',
  description: 'A short course.',
  difficulty: 'Intermediate',
  modules: [{
    id: 'm2',
    title: 'Quadratics',
    description: 'Parabolas.',
    lessons: [{ id: 'l2', title: 'Factoring', duration: '9 min', type: 'video' }],
    quiz: [],
  }],
};

function serverError(message: string) {
  const err = new axios.AxiosError('fail');
  err.response = { status: 500, data: { message } } as AxiosResponse;
  return err;
}

describe('CourseEditChatDock', () => {
  beforeEach(() => {
    vi.mocked(fetchCourse).mockReset();
    vi.mocked(updateCourse).mockReset();
    vi.mocked(sendEducatorAssistantMessage).mockReset();
  });

  it('updates the course after a saved edit and says so in the chat', async () => {
    const user = userEvent.setup();
    const onCourseChange = vi.fn();
    const renamed = {
      ...course,
      modules: [{ ...course.modules[0], title: 'Quadratic functions' }],
    };
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Renamed module 2.',
      hasCourseChanges: true,
      courseUpdate: renamed,
    });
    vi.mocked(updateCourse).mockResolvedValue({});
    vi.mocked(fetchCourse).mockResolvedValue(renamed);

    render(
      <CourseEditChatDock
        courseId="course-1"
        course={course}
        layout="column"
        onCourseChange={onCourseChange}
      />,
    );

    await user.type(screen.getByTestId('course-edit-input'), 'rename module 2');
    await user.click(screen.getByTestId('course-edit-send'));

    expect(await screen.findByTestId('course-edit-saved')).toHaveTextContent('Saved.');
    expect(screen.getByTestId('course-edit-saved')).toHaveTextContent('Quadratic functions');
    expect(onCourseChange).toHaveBeenCalledWith(expect.objectContaining({
      modules: [expect.objectContaining({ title: 'Quadratic functions' })],
    }));
    expect(sendEducatorAssistantMessage).toHaveBeenCalledWith('course-1', { message: 'rename module 2' });
  });

  it('keeps the course unchanged and shows the save error', async () => {
    const user = userEvent.setup();
    const onCourseChange = vi.fn();
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Renamed module 2.',
      hasCourseChanges: true,
      courseUpdate: {
        ...course,
        modules: [{ ...course.modules[0], title: 'Quadratic functions' }],
      },
    });
    vi.mocked(updateCourse).mockRejectedValue(serverError('Could not save that edit.'));

    render(
      <CourseEditChatDock
        courseId="course-1"
        course={course}
        layout="column"
        onCourseChange={onCourseChange}
      />,
    );

    await user.type(screen.getByTestId('course-edit-input'), 'rename module 2');
    await user.click(screen.getByTestId('course-edit-send'));

    expect(await screen.findByTestId('course-edit-error')).toHaveTextContent('Could not save that edit.');
    expect(screen.queryByTestId('course-edit-saved')).not.toBeInTheDocument();
    expect(onCourseChange).not.toHaveBeenCalled();
  });
});
