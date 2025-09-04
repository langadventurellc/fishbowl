/**
 * ChatModeIntent interface for specifying agent state changes.
 *
 * Defines the intent object structure used by chat mode handlers to specify
 * which agents should be enabled or disabled without directly mutating state.
 * This enables safe, predictable updates and easier testing through an
 * intent-based API design.
 *
 * @module types/chat-modes/ChatModeIntent
 */

/**
 * Intent object specifying agent state changes.
 *
 * Used by chat mode handlers to specify which agents should be enabled
 * or disabled without directly mutating state. This enables safe, predictable
 * updates and easier testing by separating the decision-making logic from
 * the actual state mutations.
 *
 * The intent-based approach provides several benefits:
 * - Immutable operations prevent accidental state corruption
 * - Clear separation between mode logic and state management
 * - Easier unit testing by examining return values
 * - Atomic updates ensure consistency during state transitions
 *
 * @example
 * ```typescript
 * // Enable first agent when added to empty conversation
 * const addFirstAgentIntent: ChatModeIntent = {
 *   toEnable: ["agent-1"],
 *   toDisable: []
 * };
 *
 * // Switch from one agent to another in round robin mode
 * const roundRobinIntent: ChatModeIntent = {
 *   toEnable: ["agent-2"],
 *   toDisable: ["agent-1"]
 * };
 *
 * // Disable all agents (manual mode toggle off)
 * const disableAllIntent: ChatModeIntent = {
 *   toEnable: [],
 *   toDisable: ["agent-1", "agent-2", "agent-3"]
 * };
 *
 * // No changes needed (manual mode no-op)
 * const noOpIntent: ChatModeIntent = {
 *   toEnable: [],
 *   toDisable: []
 * };
 * ```
 */
export interface ChatModeIntent {
  /**
   * Array of ConversationAgent IDs to enable.
   *
   * Contains the unique identifiers of agents that should be activated
   * and made available for participating in the conversation. Agents
   * specified in this array will have their enabled state set to true.
   *
   * @example ["agent-uuid-1", "agent-uuid-2"]
   */
  toEnable: string[];

  /**
   * Array of ConversationAgent IDs to disable.
   *
   * Contains the unique identifiers of agents that should be deactivated
   * and prevented from participating in the conversation. Agents specified
   * in this array will have their enabled state set to false.
   *
   * @example ["agent-uuid-3", "agent-uuid-4"]
   */
  toDisable: string[];
}
