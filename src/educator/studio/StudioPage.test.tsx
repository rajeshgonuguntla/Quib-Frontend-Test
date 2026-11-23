import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { type AxiosResponse } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCourse, generateCourse, updateCourse } from '../../api/educatorApi';
import { sendEducatorAssistantMessage } from '../../api/educatorAssistantApi';
import { ThemeProvider } from '../../components/ThemeContext';
import { StudioPage } from './StudioPage';

vi.mock('../../context/UserProfileContext', () => ({
  useUserProfile: () => ({
    profile: { id: 'admin-1', role: 'admin', displayName: 'Priya', email: 'priya@example.com' },
    loading: false,
    error: null,
    refreshProfile: vi.fn(),
    setProfile: vi.fn(),
  }),
}));

vi.mock('../../api/educatorApi', () => ({
  generateCourse: vi.fn(),
  fetchCourse: vi.fn(),
  updateCourse: vi.fn(),
}));

vi.mock('../../api/educatorAssistantApi', () => ({
  sendEducatorAssistantMessage: vi.fn(),
}));

const playlistUrl = 'https://www.youtube.com/playlist?list=PLreal-algebra';

function renderStudio(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/educator-studio" element={<StudioPage />} />
          <Route path="/educator-studio/:courseId" element={<StudioPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

function serverError(status: number, data: { message?: string; details?: string }) {
  const err = new axios.AxiosError('fail');
  err.response = { status, data } as AxiosResponse;
  return err;
}

describe('studio page with the course APIs', () => {
  beforeEach(() => {
    localStorage.clear();
    if (!('ResizeObserver' in globalThis)) {
      class ResizeObserverStub {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    }
    vi.mocked(generateCourse).mockReset();
    vi.mocked(fetchCourse).mockReset();
    vi.mocked(sendEducatorAssistantMessage).mockReset();
  });

  it('keeps the source card and shows the server message when generate fails', async () => {
    const user = userEvent.setup();
    vi.mocked(generateCourse).mockRejectedValue(serverError(500, { message: 'Playlist not found' }));
    renderStudio('/educator-studio');
    await user.type(screen.getByTestId('composer-input'), playlistUrl);
    await user.click(screen.getByTestId('composer-send'));
    await user.click(screen.getByTestId('source-generate'));
    expect(await screen.findByText('Playlist not found')).toBeInTheDocument();
    expect(screen.getByTestId('source-card')).toBeInTheDocument();
    expect(generateCourse).toHaveBeenCalledWith(playlistUrl, expect.objectContaining({ moduleCount: 4 }));
  });

  it('opens the returned course and sends the next message to the assistant', async () => {
    const user = userEvent.setup();
    vi.mocked(generateCourse).mockResolvedValue({
      courseId: '11111111-1111-1111-1111-111111111111',
      title: 'Algebra sprint',
      modules: [{
        id: 'm1',
        title: 'Lines',
        description: '',
        lessons: [{ id: 'l1', title: 'Slope in 12 minutes', duration: '12:00', type: 'video' }],
        quiz: [],
      }],
    });
    vi.mocked(fetchCourse).mockResolvedValue({
      title: 'Algebra sprint',
      modules: [{
        id: 'm1',
        title: 'Lines',
        description: '',
        lessons: [{ id: 'l1', title: 'Slope in 12 minutes', duration: '12:00', type: 'video' }],
        quiz: [],
      }],
    });
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Shortened the notes.',
      hasCourseChanges: false,
      courseUpdate: null,
      sessionId: 'sess-1',
      courseRevision: 'rev-1',
    });
    renderStudio('/educator-studio');
    await user.type(screen.getByTestId('composer-input'), playlistUrl);
    await user.click(screen.getByTestId('composer-send'));
    await user.click(screen.getByTestId('source-generate'));
    expect(await screen.findByTestId('course-player')).toHaveTextContent('Slope in 12 minutes');
    await user.type(screen.getByTestId('composer-input'), 'Shorten the notes');
    await user.click(screen.getByTestId('composer-send'));
    expect(await screen.findByText('Shortened the notes.')).toBeInTheDocument();
    expect(sendEducatorAssistantMessage).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      expect.objectContaining({ message: 'Shorten the notes' }),
    );
  });

  it('puts an assistant rename into the outline and saves it on accept', async () => {
    const user = userEvent.setup();
    const courseId = '11111111-1111-1111-1111-111111111111';
    const original = {
      title: 'Python for Beginners',
      difficulty: 'Intermediate',
      description: '',
      modules: [{
        id: 'm1',
        title: 'Introduction to Python',
        description: '',
        lessons: [{ id: 'l1', title: 'Getting started', duration: '8:00', type: 'video' as const }],
        quiz: [],
      }],
    };
    const renamed = {
      ...original,
      modules: [{ ...original.modules[0], title: 'Python Fundamentals & Setup' }],
    };
    vi.mocked(fetchCourse).mockResolvedValueOnce(original).mockResolvedValueOnce(renamed);
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: "Module 'Python Fundamentals & Setup' has been renamed.",
      hasCourseChanges: true,
      courseUpdate: renamed,
      sessionId: 'sess-1',
    });
    renderStudio(`/educator-studio/${courseId}`);
    expect(await screen.findByTestId('course-player')).toHaveTextContent('Introduction to Python');
    await user.type(screen.getByTestId('composer-input'), 'Rename this module');
    await user.click(screen.getByTestId('composer-send'));
    expect(await screen.findByTestId('course-player')).toHaveTextContent('Python Fundamentals & Setup');
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(updateCourse).toHaveBeenCalledWith(courseId, expect.objectContaining({
      modules: [expect.objectContaining({ title: 'Python Fundamentals & Setup' })],
    }));
  });

  it('applies quiz, flashcard, and lesson changes from the assistant to the outline', async () => {
    const user = userEvent.setup();
    const courseId = '11111111-1111-1111-1111-111111111111';
    const lesson = {
      id: 'l1',
      title: 'Getting started',
      duration: '8:00',
      type: 'video' as const,
      flashcards: [{ front: 'Interpreter', back: 'Runs code a line at a time' }],
    };
    const original = {
      title: 'Python for Beginners',
      difficulty: 'Intermediate',
      description: '',
      modules: [{
        id: 'm1',
        title: 'Introduction to Python',
        description: '',
        lessons: [lesson],
        quiz: [{ question: 'What is Python?', options: ['A', 'B', 'C', 'D'], answer: 0 }],
      }],
    };
    const edited = {
      ...original,
      modules: [{
        ...original.modules[0],
        lessons: [
          { ...lesson, flashcards: [...lesson.flashcards, { front: 'Variable', back: 'A named value' }] },
          { id: 'l2', title: 'Variables', duration: '6:00', type: 'video' as const },
        ],
        quiz: [
          ...original.modules[0].quiz,
          { question: 'What is a variable?', options: ['A', 'B', 'C', 'D'], answer: 1 },
        ],
      }],
    };
    vi.mocked(fetchCourse).mockResolvedValueOnce(original).mockResolvedValueOnce(edited);
    vi.mocked(sendEducatorAssistantMessage).mockResolvedValue({
      reply: 'Added a lesson, a flashcard, and a quiz question.',
      hasCourseChanges: true,
      courseUpdate: edited,
      operations: [{ type: 'SET', path: 'title', value: 'This operation is not the course' }],
    });
    renderStudio(`/educator-studio/${courseId}`);
    expect(await screen.findByTestId('studio-course-title')).toHaveTextContent('Python for Beginners');
    await user.type(screen.getByTestId('composer-input'), 'Add a lesson, a flashcard, and a quiz question');
    await user.click(screen.getByTestId('composer-send'));
    const player = await screen.findByTestId('course-player');
    await user.hover(screen.getByRole('button', { name: 'Introduction to Python' }));
    expect(await screen.findByRole('menuitem', { name: /Variables/ })).toBeInTheDocument();
    expect(player).toHaveTextContent('Module quiz');
    expect(player).toHaveTextContent('2 QUESTIONS');
    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(updateCourse).toHaveBeenCalledWith(courseId, expect.objectContaining({
      modules: [expect.objectContaining({
        lessons: [
          expect.objectContaining({ flashcards: expect.arrayContaining([expect.objectContaining({ front: 'Variable' })]) }),
          expect.objectContaining({ title: 'Variables' }),
        ],
        quiz: expect.arrayContaining([expect.objectContaining({ question: 'What is a variable?' })]),
      })],
    }));
  });

  it('keeps the SAT sample off the assistant', async () => {
    const user = userEvent.setup();
    renderStudio('/educator-studio/sat-math-sprint');
    expect(await screen.findByTestId('studio-course-title')).toHaveTextContent('SAT Math Sprint');
    await user.type(screen.getByTestId('composer-input'), 'Hello');
    await user.click(screen.getByTestId('composer-send'));
    expect(await screen.findByText(/This preview is static/)).toBeInTheDocument();
    expect(fetchCourse).not.toHaveBeenCalled();
    expect(sendEducatorAssistantMessage).not.toHaveBeenCalled();
  });
});
