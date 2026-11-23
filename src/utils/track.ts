/** Analytics stub. No sink until one is chosen. */
export function track(event: string, props?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug('[track]', event, props ?? {});
  }
}
