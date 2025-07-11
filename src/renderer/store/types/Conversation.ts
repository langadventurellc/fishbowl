/**
 * Conversation data structure
 *
 * Matches the shared conversation interface used by IPC layer
 */

export interface Conversation {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}
