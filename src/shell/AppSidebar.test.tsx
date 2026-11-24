import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppSidebar } from './AppSidebar';
import { SIGN_IN_INTENT_KEY } from '../utils/signInIntent';

const profileState = vi.hoisted(() => ({
  role: 'learner' as string | undefined,
}));

vi.mock('../context/UserProfileContext', () => ({
  useUserProfile: () => ({
    profile: profileState.role ? { role: profileState.role } : null,
    loading: false,
    error: null,
    refreshProfile: vi.fn(),
    setProfile: vi.fn(),
  }),
}));

function navIds(): string[] {
  return screen.getAllByTestId('nav-item').map((item) => item.getAttribute('data-nav-id') ?? '');
}

function renderSidebar(pathname = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <AppSidebar pathname={pathname} search="" />
    </MemoryRouter>,
  );
}

describe('profile based nav', () => {
  beforeEach(() => {
    profileState.role = 'learner';
    localStorage.removeItem(SIGN_IN_INTENT_KEY);
  });

  it('keeps a learner on Home through Progress', () => {
    renderSidebar();
    expect(navIds()).toEqual(['home', 'my-courses', 'practice', 'notes', 'review', 'progress', 'settings']);
    expect(screen.queryByText('Cubit Studio')).not.toBeInTheDocument();
    expect(screen.queryByText('Published courses')).not.toBeInTheDocument();
  });

  it('keeps a missing role on the learner rail', () => {
    profileState.role = undefined;
    renderSidebar();
    expect(navIds()).toEqual(['home', 'my-courses', 'practice', 'notes', 'review', 'progress', 'settings']);
  });

  it('gives an educator the creator rail', () => {
    profileState.role = 'educator';
    renderSidebar('/educator-courses');
    expect(navIds()).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Practice')).not.toBeInTheDocument();
    expect(screen.queryByText('Progress')).not.toBeInTheDocument();
  });

  it('gives an admin the same creator rail', () => {
    profileState.role = 'admin';
    renderSidebar('/educator-courses');
    expect(navIds()).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
  });

  it('keeps the creator rail for an educator even after a student sign-in', () => {
    localStorage.setItem(SIGN_IN_INTENT_KEY, 'student');
    profileState.role = 'educator';
    renderSidebar('/educator-courses');
    expect(navIds()).toEqual(['studio', 'published-courses', 'my-courses-educator', 'settings']);
  });
});
