/**
 * ConversationAgentViewModel interface for conversation UI system.
 *
 * View model for conversation agent associations with populated agent data.
 * Combines conversation agent data with populated agent configuration
 * details from the settings store.
 *
 * This interface provides a populated version of ConversationAgent that includes
 * the full agent configuration data, bridging the gap between database entities
 * and UI display requirements.
 *
 * @module types/ui/conversationAgents/ConversationAgentViewModel
 */

import type { AgentSettingsViewModel } from "../settings";

/**
 * View model for conversation agent associations with populated agent data.
 *
 * Combines conversation agent data with populated agent configuration
 * details from the settings store. This interface is used by the service
 * layer and UI components to display agent information within conversations.
 *
 * The populated agent field provides the bridge between database and settings
 * data, ensuring that UI components have access to complete agent configuration
 * details for display purposes.
 *
 * @example
 * ```typescript
 * const conversationAgent: ConversationAgentViewModel = {
 *   id: "ca-123",
 *   conversationId: "conv-456",
 *   agentId: "agent-789",
 *   agent: {
 *     id: "agent-789",
 *     name: "Technical Advisor",
 *     role: "Backend Developer",
 *     // ... other AgentSettingsViewModel properties
 *   },
 *   addedAt: new Date("2024-01-15T10:30:00Z"),
 *   isActive: true,
 *   displayOrder: 0
 * };
 * ```
 */
export interface ConversationAgentViewModel {
  /** Unique identifier for the conversation-agent association */
  id: string;

  /** ID of the conversation */
  conversationId: string;

  /** ID of the agent configuration (from settings store) */
  agentId: string;

  /** Full agent configuration data populated from settings */
  agent: AgentSettingsViewModel;

  /** When the agent was added to the conversation */
  addedAt: Date;

  /** Whether the agent association is currently active */
  isActive: boolean;

  /** Display order for UI sorting (0-based) */
  displayOrder: number;
}
