/** Simple RFC4122-ish id generator; sufficient for a local-only single-device app. */
export function generateId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}${random}`;
}
