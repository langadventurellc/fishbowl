/**
 * Represents a conversation entity with metadata
 */
export interface Conversation {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Display title for the conversation */
  title: string;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
}
