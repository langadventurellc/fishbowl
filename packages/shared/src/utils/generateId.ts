import { randomBytes } from "crypto";

/**
 * Generates a unique identifier for configurations and entities.
 *
 * Uses Node.js crypto.randomBytes to generate a UUID-like identifier.
 * Provides consistent behavior across different environments.
 *
 * @returns A unique string identifier
 *
 * @example
 * const id = generateId();
 * // Returns: "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateId(): string {
  try {
    // Generate 16 random bytes
    const bytes = randomBytes(16);

    // Convert to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const hex = bytes.toString("hex");
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      "4" + hex.substring(13, 16), // Version 4 UUID
      ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
        hex.substring(17, 20),
      hex.substring(20, 32),
    ].join("-");
  } catch {
    // Fallback: timestamp in base36 + random string
    // This provides reasonable uniqueness for configuration purposes
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
