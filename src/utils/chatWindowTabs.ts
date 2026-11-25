const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export const CHAT_STRIP_LIMIT = 7;

export function chatStamp(): number {
  return Date.now();
}

export function formatChatTabTime(updatedAt: number | null, now: number): string {
  if (updatedAt == null) return 'Not started';
  const elapsed = now - updatedAt;
  if (elapsed < 60_000) return 'Just now';
  if (elapsed < 60 * 60_000) {
    const mins = Math.max(1, Math.floor(elapsed / 60_000));
    return `${mins} min ago`;
  }
  const when = new Date(updatedAt);
  const clock = formatClock(when);
  const dayGap = calendarDaysBetween(updatedAt, now);
  if (dayGap <= 0) return `Today, ${clock}`;
  if (dayGap === 1) return `Yesterday, ${clock}`;
  if (dayGap < 7) return `${WEEKDAYS[when.getDay()]}, ${clock}`;
  const year = when.getFullYear();
  const date = year === new Date(now).getFullYear()
    ? `${MONTHS[when.getMonth()]} ${when.getDate()}`
    : `${MONTHS[when.getMonth()]} ${when.getDate()}, ${year}`;
  return `${date}, ${clock}`;
}

export function visibleChatTabs<T extends { id: string; lastFocusedAt: number }>(
  tabs: T[],
  activeId: string | null,
  limit: number,
): T[] {
  if (limit < 1 || tabs.length <= limit) return tabs;
  const ranked = [...tabs].sort((a, b) => b.lastFocusedAt - a.lastFocusedAt);
  const keep = new Set(ranked.slice(0, limit).map((tab) => tab.id));
  if (activeId && !keep.has(activeId)) {
    const drop = ranked[limit - 1];
    if (drop) keep.delete(drop.id);
    keep.add(activeId);
  }
  return tabs.filter((tab) => keep.has(tab.id));
}

export function latestChatForMode<T extends { mode: string; lastFocusedAt: number }>(
  tabs: T[],
  mode: string,
): T | null {
  let latest: T | null = null;
  for (const tab of tabs) {
    if (tab.mode !== mode) continue;
    if (!latest || tab.lastFocusedAt > latest.lastFocusedAt) latest = tab;
  }
  return latest;
}

export function chatsForMenu<T extends { title: string; updatedAt: number | null; openedAt: number }>(
  tabs: T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase();
  const matched = needle
    ? tabs.filter((tab) => tab.title.toLowerCase().includes(needle))
    : tabs.slice();
  return matched.sort((a, b) => b.openedAt - a.openedAt);
}

export function newChatShortcutLabel(userAgent: string): string {
  return /Mac|iPhone|iPad/.test(userAgent) ? '⌘T' : 'Ctrl T';
}

function formatClock(date: Date): string {
  const raw = date.getHours();
  const suffix = raw >= 12 ? 'PM' : 'AM';
  const hours = raw % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
}

function calendarDaysBetween(then: number, now: number): number {
  const start = new Date(then);
  start.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / 86_400_000);
}
