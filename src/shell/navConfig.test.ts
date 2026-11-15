import { describe, expect, it } from 'vitest';
import { NAV_GROUPS, getRouteMeta, isNavItemActive } from './navConfig';

const learnerIds = NAV_GROUPS[0]!.items.map((item) => item.id);

describe('learner left nav', () => {
  it('lists Home through Progress in order', () => {
    expect(learnerIds.slice(0, 6)).toEqual([
      'home',
      'my-courses',
      'practice',
      'notes',
      'review',
      'progress',
    ]);
    expect(NAV_GROUPS[0]!.items.slice(0, 6).map((item) => item.label)).toEqual([
      'Home',
      'My courses',
      'Practice',
      'Notes',
      'Review',
      'Progress',
    ]);
  });

  it('does not put Browse or Creators in the learner rail', () => {
    expect(learnerIds).not.toContain('browse');
    expect(learnerIds).not.toContain('creators');
  });

  it('marks the matching rail item active', () => {
    expect(isNavItemActive('/dashboard', '', 'home', '/dashboard')).toBe(true);
    expect(isNavItemActive('/my-courses', '', 'my-courses', '/my-courses')).toBe(true);
    expect(isNavItemActive('/course-details/abc', '', 'my-courses', '/my-courses')).toBe(true);
    expect(isNavItemActive('/practice', '', 'practice', '/practice')).toBe(true);
    expect(isNavItemActive('/quiz-setup/1', '', 'practice', '/practice')).toBe(true);
    expect(isNavItemActive('/notes', '', 'notes', '/notes')).toBe(true);
    expect(isNavItemActive('/review', '', 'review', '/review')).toBe(true);
    expect(isNavItemActive('/results/1', '', 'review', '/review')).toBe(true);
    expect(isNavItemActive('/library', '?tab=all', 'progress', '/library?tab=all')).toBe(true);
    expect(isNavItemActive('/my-courses', '', 'progress', '/library?tab=all')).toBe(false);
  });

  it('keeps course details under My courses', () => {
    expect(getRouteMeta('/course-details/abc').parent).toEqual({
      label: 'My courses',
      path: '/my-courses',
    });
  });
});
