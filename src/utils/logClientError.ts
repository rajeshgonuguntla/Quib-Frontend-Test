export function logClientError(label: string, err: unknown): void {
  const status =
    typeof err === 'object' && err !== null && 'response' in err
      ? (err as { response?: { status?: number } }).response?.status
      : undefined;
  const message = err instanceof Error ? err.message : String(err);
  console.error(label, status ?? '', message);
}
