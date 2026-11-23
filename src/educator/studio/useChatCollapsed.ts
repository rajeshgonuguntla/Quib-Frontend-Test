const STORAGE_PREFIX = 'cubit_studio_v1:';

type StudioStore = {
  v: 1;
  threads: Record<string, unknown>;
  ui: { chatCollapsed?: boolean };
};

export function studioStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function readChatCollapsed(userId: string): boolean {
  try {
    const raw = localStorage.getItem(studioStorageKey(userId));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as StudioStore;
    return Boolean(parsed?.ui?.chatCollapsed);
  } catch {
    return false;
  }
}

export function writeChatCollapsed(userId: string, chatCollapsed: boolean): void {
  const key = studioStorageKey(userId);
  let next: StudioStore = { v: 1, threads: {}, ui: { chatCollapsed } };
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StudioStore>;
      next = {
        v: 1,
        threads: parsed.threads ?? {},
        ui: { ...(parsed.ui ?? {}), chatCollapsed },
      };
    }
  } catch {
    next = { v: 1, threads: {}, ui: { chatCollapsed } };
  }
  localStorage.setItem(key, JSON.stringify(next));
}
