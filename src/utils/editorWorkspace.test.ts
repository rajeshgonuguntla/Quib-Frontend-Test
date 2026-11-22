import { describe, expect, it } from 'vitest';
import { STUDIO_V2_ENABLED } from '../config/features';
import { isEducatorWorkspaceRoute } from './editorWorkspace';

describe('isEducatorWorkspaceRoute', () => {
  it('keeps the course editor full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-courses/abc/edit')).toBe(true);
  });

  it('treats a studio course thread as full-bleed', () => {
    expect(isEducatorWorkspaceRoute('/educator-studio/abc')).toBe(true);
  });

  it('keeps the studio index in the shell when Studio v2 is on', () => {
    expect(isEducatorWorkspaceRoute('/educator-studio')).toBe(!STUDIO_V2_ENABLED);
  });
});
