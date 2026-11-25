import { describe, expect, it } from 'vitest';
import { CHAT_STRIP_LIMIT, chatsForMenu, formatChatTabTime, latestChatForMode, newChatShortcutLabel, visibleChatTabs } from './chatWindowTabs';

const now = new Date(2026, 10, 25, 21, 42).getTime();

describe('formatChatTabTime', () => {
  it('labels an unsent chat and the recent buckets from the mock', () => {
    expect(formatChatTabTime(null, now)).toBe('Not started');
    expect(formatChatTabTime(now - 10_000, now)).toBe('Just now');
    expect(formatChatTabTime(now - 12 * 60_000, now)).toBe('12 min ago');
    expect(formatChatTabTime(new Date(2026, 10, 25, 9, 42).getTime(), now)).toBe('Today, 9:42 AM');
    expect(formatChatTabTime(new Date(2026, 10, 24, 18, 10).getTime(), now)).toBe('Yesterday, 6:10 PM');
    expect(formatChatTabTime(new Date(2026, 10, 23, 16, 5).getTime(), now)).toBe('Mon, 4:05 PM');
    expect(formatChatTabTime(new Date(2026, 10, 12, 15, 20).getTime(), now)).toBe('Nov 12, 3:20 PM');
  });
});

describe('visibleChatTabs', () => {
  it('keeps creation order and always includes the open chat', () => {
    const tabs = [
      { id: 'a', lastFocusedAt: 1 },
      { id: 'b', lastFocusedAt: 2 },
      { id: 'c', lastFocusedAt: 3 },
      { id: 'd', lastFocusedAt: 4 },
      { id: 'e', lastFocusedAt: 5 },
    ];
    expect(visibleChatTabs(tabs, 'e', 4).map((tab) => tab.id)).toEqual(['b', 'c', 'd', 'e']);
    expect(visibleChatTabs(tabs, 'a', 4).map((tab) => tab.id)).toEqual(['a', 'c', 'd', 'e']);
    expect(visibleChatTabs(tabs.slice(0, 2), 'a', 4).map((tab) => tab.id)).toEqual(['a', 'b']);
  });

  it('keeps at most seven chats in the strip, including the open one', () => {
    const tabs = Array.from({ length: 8 }, (_, index) => ({ id: String(index), lastFocusedAt: index + 1 }));
    const visible = visibleChatTabs(tabs, '0', CHAT_STRIP_LIMIT);
    expect(visible).toHaveLength(7);
    expect(visible.map((tab) => tab.id)).toContain('0');
  });
});

describe('latestChatForMode', () => {
  it('returns the chat last opened in that category', () => {
    const tabs = [
      { mode: 'cubit', lastFocusedAt: 2, title: 'hi' },
      { mode: 'course', lastFocusedAt: 5, title: 'playlist' },
      { mode: 'cubit', lastFocusedAt: 4, title: 'slopes' },
    ];
    expect(latestChatForMode(tabs, 'cubit')?.title).toBe('slopes');
    expect(latestChatForMode(tabs, 'notes')).toBeNull();
  });
});

describe('chatsForMenu', () => {
  it('lists the newest chat first and keeps older ones below', () => {
    const tabs = [
      { title: 'hi', updatedAt: now, openedAt: 1 },
      { title: 'New chat', updatedAt: null, openedAt: 3 },
      { title: 'Quadratic word problems', updatedAt: now - 1000, openedAt: 2 },
    ];
    expect(chatsForMenu(tabs, '').map((tab) => tab.title)).toEqual([
      'New chat',
      'Quadratic word problems',
      'hi',
    ]);
    expect(chatsForMenu(tabs, 'HI').map((tab) => tab.title)).toEqual(['hi']);
  });
});

describe('newChatShortcutLabel', () => {
  it('uses the command key on Apple devices', () => {
    expect(newChatShortcutLabel('Mozilla/5.0 (Macintosh)')).toBe('⌘T');
    expect(newChatShortcutLabel('Mozilla/5.0 (Windows NT 10.0)')).toBe('Ctrl T');
  });
});
