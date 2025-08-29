/**
 * ConversationAgentViewModel interface for conversation agent UI system.
 *
 * Represents a conversation agent association with populated agent data for
 * UI components. This interface extends the base ConversationAgent with
 * populated agent settings and provides camelCase properties for UI consistency.
 *
 * @module types/conversationAgents/ConversationAgentViewModel
 */

import type { AgentSettingsViewModel } from "../settings/AgentSettingsViewModel";

/**
 * Represents a conversation agent association with populated agent data in the UI system.
 *
 * This interface defines the structure for conversation agent entities displayed
 * in the UI, including the agent association metadata and the populated agent
 * settings data for rendering agent information.
 *
 * The interface provides camelCase properties for consistency with other UI ViewModels,
 * while the underlying data layer uses snake_case for database compatibility.
 *
 * @example
 * ```typescript
 * const conversationAgent: ConversationAgentViewModel = {
 *   id: "ca-123",
 *   conversationId: "conv-456",
 *   agentId: "agent-789",
 *   agent: {
 *     id: "agent-789",
 *     name: "Code Assistant",
 *     role: "Developer Helper",
 *     // ... other agent settings
 *   },
 *   addedAt: "2025-01-15T10:30:00.000Z",
 *   isActive: true,
 *   displayOrder: 0
 * };
 * ```
 */
export interface ConversationAgentViewModel {
  /**
   * Unique identifier for the conversation agent association.
   * Used for operations like removal and updates.
   */
  id: string;

  /**
   * Foreign key reference to the conversation.
   * Links this agent association to a specific conversation.
   */
  conversationId: string;

  /**
   * Configuration ID referencing the agent settings.
   * This references the agent's configuration stored in settings,
   * not a database foreign key relationship.
   */
  agentId: string;

  /**
   * Populated agent data from agent settings.
   * Contains the complete agent configuration including name, role,
   * personality, and other settings needed for UI rendering.
   */
  agent: AgentSettingsViewModel;

  /**
   * ISO 8601 timestamp when the agent was added to the conversation.
   * Used for displaying when the agent joined and for ordering.
   *
   * @example "2025-01-15T10:30:00.000Z"
   */
  addedAt: string;

  /**
   * Whether this agent association is currently active.
   * Controls whether the agent participates in conversation interactions.
   * Inactive agents may be hidden or displayed differently in the UI.
   */
  isActive: boolean;

  /**
   * Whether this agent participates in new messages.
   * Controls whether the agent will receive and respond to new messages
   * in the conversation. Can be toggled independently of isActive.
   */
  enabled: boolean;

  /**
   * Display ordering for UI presentation.
   * Lower numbers appear first in agent lists and pills.
   * Used for future enhancement of agent reordering functionality.
   */
  displayOrder: number;
}
