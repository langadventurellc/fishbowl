/**
 * Generates a unique identifier for LLM API configurations.
 *
 * Uses crypto.randomUUID() when available (modern browsers/Electron),
 * with a fallback to timestamp + random string for older environments.
 *
 * @returns A unique string identifier suitable for React keys
 *
 * @example
 * const id = generateId();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000" (with crypto)
 * // or: "lxik9uj7x0.8h2kqo8fr" (with fallback)
 */
export function generateId(): string {
  // Use native crypto.randomUUID if available (preferred method)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp in base36 + random string
  // This provides reasonable uniqueness for UI purposes
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
