/**
 * Agent interface for UI components
 *
 * @module types/ui/settings/AgentViewModel
 */
import type { AgentFormData } from "./AgentFormData";

/**
 * Agent with timestamps for UI display in settings
 */
export interface AgentSettingsViewModel extends AgentFormData {
  /** Unique identifier for the agent */
  id: string;
  /** When the agent was created (nullable) */
  createdAt?: string;
  /** When the agent was last updated (nullable) */
  updatedAt?: string;
}
