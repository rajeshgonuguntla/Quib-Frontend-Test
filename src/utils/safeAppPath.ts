/** Same-app relative path: one leading slash, not protocol-relative `//host`. */
export function safeAppPath(path: unknown): string | undefined {
  if (typeof path !== 'string' || !/^\/(?!\/)/.test(path)) {
    return undefined;
  }
  if (path.includes('\\') || path.includes('\n') || path.includes('\r')) {
    return undefined;
  }
  return path;
}
