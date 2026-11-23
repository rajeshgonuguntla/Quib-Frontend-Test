import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeContext';
import { CourseDetails } from './CourseDetails';

const profileState = vi.hoisted(() => ({
  role: 'educator' as string,
  isOwner: true,
}));

vi.mock('../context/UserProfileContext', () => ({
  useUserProfile: () => ({
    profile: {
      id: 'user-1',
      role: profileState.role,
      email: 'ada@example.com',
      displayName: 'Ada',
    },
    loading: false,
    error: null,
    refreshProfile: vi.fn(),
    setProfile: vi.fn(),
  }),
}));

const courseId = '02eecd22-702f-42fc-9cf2-daa446659153';

const courseBody = {
  courseId,
  title: 'Vectors in the plane',
  description: 'A course about vectors.',
  difficulty: 'Intermediate',
  date: '11/23/2026',
  isPublished: false,
  modules: [{
    id: 'm1',
    title: 'Components',
    description: 'Break a vector into parts.',
    lessons: [{ id: 'l1', title: 'i and j', duration: '6 min', type: 'video' }],
    quiz: [],
  }],
};

function renderDetails() {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[`/course-details/${courseId}`]}>
        <Routes>
          <Route path="/course-details/:courseId" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('course details edit chat visibility', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cuib_session_exp', String(Math.floor(Date.now() / 1000) + 3600));
    profileState.role = 'educator';
    profileState.isOwner = true;
    vi.spyOn(axios, 'get').mockImplementation(async (url) => {
      const path = String(url);
      if (path.includes('/progress')) {
        return {
          data: {
            completedLessonIds: [],
            passedModuleIds: [],
            progressPercent: 0,
            totalLessons: 1,
            completedLessons: 0,
            totalQuizModules: 0,
            passedQuizModules: 0,
          },
        };
      }
      if (path.includes(`/api/course/${courseId}`)) {
        return { data: { ...courseBody, isOwner: profileState.isOwner } };
      }
      throw new Error(`unexpected ${path}`);
    });
  });

  it('docks the edit chat for the course owner', async () => {
    renderDetails();
    expect(await screen.findByRole('heading', { name: 'Vectors in the plane' })).toBeInTheDocument();
    expect(screen.getByTestId('course-edit-chat')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Edit with chat' })).toBeInTheDocument();
  });

  it('leaves the page unchanged for a student', async () => {
    profileState.role = 'learner';
    profileState.isOwner = false;
    renderDetails();
    expect(await screen.findByRole('heading', { name: 'Vectors in the plane' })).toBeInTheDocument();
    expect(screen.queryByTestId('course-edit-chat')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Edit with chat' })).not.toBeInTheDocument();
  });

  it('hides the edit chat from an owner who is not an educator', async () => {
    profileState.role = 'learner';
    profileState.isOwner = true;
    renderDetails();
    expect(await screen.findByRole('heading', { name: 'Vectors in the plane' })).toBeInTheDocument();
    expect(screen.queryByTestId('course-edit-chat')).not.toBeInTheDocument();
  });
});
