import { describe, expect, it } from 'vitest';
import { STUDIO_V2_ENABLED } from '../config/features';
import { isEducatorWorkspaceRoute, isStudioV2Route } from './editorWorkspace';

describe('isEducatorWorkspaceRoute', () => {
  it('keeps the course editor full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-courses/abc/edit')).toBe(true);
  });

  it('treats every studio path as full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-studio')).toBe(true);
    expect(isEducatorWorkspaceRoute('/educator-studio/abc')).toBe(true);
  });

  it('uses the studio frame only when Studio v2 is on', () => {
    expect(isStudioV2Route('/educator-studio')).toBe(STUDIO_V2_ENABLED);
    expect(isStudioV2Route('/educator-studio/abc')).toBe(STUDIO_V2_ENABLED);
    expect(isStudioV2Route('/dashboard')).toBe(false);
  });
});
