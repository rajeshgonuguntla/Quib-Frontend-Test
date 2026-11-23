import { beforeEach, describe, expect, it } from 'vitest';
import { readChatCollapsed, studioStorageKey, writeChatCollapsed } from './useChatCollapsed';

describe('studio chat collapsed storage', () => {
  beforeEach(() => localStorage.clear());

  it('stores chatCollapsed on cubit_studio_v1:<userId>', () => {
    writeChatCollapsed('e2e-user', true);
    expect(localStorage.getItem(studioStorageKey('e2e-user'))).toContain('"chatCollapsed":true');
    expect(readChatCollapsed('e2e-user')).toBe(true);
  });

  it('keeps existing thread data when the flag changes', () => {
    localStorage.setItem(
      studioStorageKey('e2e-user'),
      JSON.stringify({ v: 1, threads: { new: { title: 'Draft' } }, ui: { chatCollapsed: false } }),
    );
    writeChatCollapsed('e2e-user', true);
    const stored = JSON.parse(localStorage.getItem(studioStorageKey('e2e-user'))!);
    expect(stored.threads.new.title).toBe('Draft');
    expect(stored.ui.chatCollapsed).toBe(true);
  });
});
