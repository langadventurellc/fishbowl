/**
 * Persistence-optimized interface for individual role data.
 *
 * This interface is designed for JSON serialization/deserialization with:
 * - String-based identifiers for uniqueness
 * - Character-limited text fields for security
 * - Optional ISO datetime strings for timestamps
 * - Security-conscious validation limits
 */
export interface PersistedRole {
  /** Unique identifier for the role */
  id: string;

  /** Display name (1-100 characters) */
  name: string;

  /** Role description (1-500 characters) */
  description: string;

  /** AI instruction prompt (1-5000 characters) */
  systemPrompt: string;

  /** ISO datetime when role was created (nullable for manual edits) */
  createdAt?: string | null;

  /** ISO datetime when role was last updated (nullable for manual edits) */
  updatedAt?: string | null;
}
