import { describe, expect, it } from 'vitest';
import type { UserProfile } from '../types/userProfile';
import { isEducatorWorkspaceRoute, isStudioV2Route } from './editorWorkspace';

const admin = { role: 'admin' } as UserProfile;
const educator = { role: 'educator' } as UserProfile;

describe('isEducatorWorkspaceRoute', () => {
  it('keeps the course editor full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-courses/abc/edit')).toBe(true);
  });

  it('treats every studio path as full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-studio')).toBe(true);
    expect(isEducatorWorkspaceRoute('/educator-studio/abc')).toBe(true);
  });

  it('uses the studio frame for an admin and an educator', () => {
    expect(isStudioV2Route('/educator-studio', admin)).toBe(true);
    expect(isStudioV2Route('/educator-studio/abc', admin)).toBe(true);
    expect(isStudioV2Route('/educator-studio', educator)).toBe(true);
    expect(isStudioV2Route('/educator-studio/abc', educator)).toBe(true);
    expect(isStudioV2Route('/educator-studio', null)).toBe(false);
    expect(isStudioV2Route('/dashboard', admin)).toBe(false);
  });
});
