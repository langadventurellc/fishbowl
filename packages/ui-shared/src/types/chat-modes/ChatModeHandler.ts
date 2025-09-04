/**
 * ChatModeHandler interface for chat mode strategy pattern.
 *
 * Defines the contract for implementing different chat mode behaviors using
 * the strategy pattern. All chat mode handlers must implement this interface
 * to provide consistent behavior for agent management operations.
 *
 * @module types/chat-modes/ChatModeHandler
 */

import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeIntent } from "./ChatModeIntent";

/**
 * Strategy interface for handling chat mode behavior.
 *
 * Chat mode handlers manage how agents are enabled/disabled in different modes
 * such as manual control or round-robin rotation. All methods return intent
 * objects to enable safe, predictable state updates without direct mutation.
 *
 * The strategy pattern allows for easy extension of chat modes without modifying
 * existing code, promoting the open-closed principle. Each mode can implement
 * its own logic for agent management while maintaining a consistent interface.
 *
 * Key design principles:
 * - Immutable operations through intent objects
 * - Predictable behavior across different modes
 * - Easy testing and debugging
 * - Extensible architecture for new modes
 *
 * @example
 * ```typescript
 * // Manual mode handler - preserves user control
 * const manualHandler = createChatModeHandler("manual");
 * const manualIntent = manualHandler.handleAgentAdded(agents, newAgentId);
 * // Returns: { toEnable: [], toDisable: [] } - no automatic changes
 *
 * // Round robin mode handler - automatic rotation
 * const roundRobinHandler = createChatModeHandler("round-robin");
 * const addIntent = roundRobinHandler.handleAgentAdded(agents, newAgentId);
 * // Returns: { toEnable: [newAgentId], toDisable: [] } if first agent
 *
 * const progressIntent = roundRobinHandler.handleConversationProgression(agents);
 * // Returns: { toEnable: [nextAgentId], toDisable: [currentAgentId] }
 *
 * // Apply intent to state management
 * intent.toEnable.forEach(id => enableAgent(id));
 * intent.toDisable.forEach(id => disableAgent(id));
 * ```
 */
export interface ChatModeHandler {
  /**
   * The name of this chat mode.
   *
   * Unique identifier for the chat mode implementation, used for mode
   * selection and debugging. Should be consistent across all instances
   * of the same mode type.
   *
   * @example "manual", "round-robin"
   */
  readonly name: string;

  /**
   * Handle addition of a new agent to the conversation.
   *
   * Called when a user adds a new agent to the conversation. The handler
   * determines whether the new agent should be enabled immediately and
   * whether any existing agents should be disabled to maintain mode-specific
   * constraints.
   *
   * IMPORTANT: The agents parameter represents the current conversation agents
   * AFTER the new agent has been added to the state, meaning newAgentId is
   * present in the array. The handler must handle post-add semantics and
   * account for the new agent's current enabled state.
   *
   * Different modes handle this differently:
   * - Manual mode: No automatic changes, preserves current state
   * - Round robin mode: Enables only the first agent and disables subsequent
   *   additions by default if any agent is already enabled
   *
   * @param agents - Current conversation agents array AFTER the new agent has been added
   * @param newAgentId - ID of the newly added agent (present in the agents array)
   * @returns Intent specifying which agents to enable/disable
   *
   * @example
   * ```typescript
   * // Manual mode - no automatic changes
   * const manualIntent = handler.handleAgentAdded(
   *   [{ id: "agent-1", enabled: true }, { id: "agent-2", enabled: false }],
   *   "agent-3"
   * );
   * // Returns: { toEnable: [], toDisable: [] }
   *
   * // Round robin mode - enable first agent in empty conversation
   * const emptyConversation: ConversationAgent[] = [];
   * const roundRobinIntent = handler.handleAgentAdded(emptyConversation, "agent-1");
   * // Returns: { toEnable: ["agent-1"], toDisable: [] }
   *
   * // Round robin mode - disable new agent when another is already enabled (post-add)
   * const agentsPostAdd = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: true, display_order: 1 } // new agent arrives enabled
   * ];
   * const disableIntent = handler.handleAgentAdded(agentsPostAdd, "agent-2");
   * // Returns: { toEnable: [], toDisable: ["agent-2"] }
   * ```
   */
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent;

  /**
   * Handle manual toggle of an agent's enabled state.
   *
   * Called when a user manually enables or disables an agent through the UI.
   * The handler determines what additional state changes are needed to maintain
   * mode-specific behavior and constraints.
   *
   * Different modes handle this differently:
   * - Manual mode: No additional changes, respects user choice
   * - Round robin mode: May disable other agents when enabling one
   *
   * @param agents - Current conversation agents array (immutable reference)
   * @param toggledAgentId - ID of the agent being toggled
   * @returns Intent specifying which agents to enable/disable
   *
   * @example
   * ```typescript
   * // Manual mode - no additional changes
   * const manualIntent = handler.handleAgentToggle(
   *   [{ id: "agent-1", enabled: true }, { id: "agent-2", enabled: false }],
   *   "agent-2"
   * );
   * // Returns: { toEnable: [], toDisable: [] } - respects user choice
   *
   * // Round robin mode - disable others when enabling one
   * const roundRobinIntent = handler.handleAgentToggle(
   *   [{ id: "agent-1", enabled: true }, { id: "agent-2", enabled: false }],
   *   "agent-2"
   * );
   * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
   * ```
   */
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent;

  /**
   * Handle progression after an agent completes a response.
   *
   * Called when an agent finishes generating a response and the conversation
   * is ready to progress to the next turn. The handler determines which
   * agents should be enabled for the next turn based on mode-specific logic.
   *
   * Different modes handle this differently:
   * - Manual mode: No automatic changes, user controls progression
   * - Round robin mode: Automatically rotates to next agent in sequence
   *
   * @param agents - Current conversation agents array (immutable reference)
   * @returns Intent specifying which agents to enable/disable for next turn
   *
   * @example
   * ```typescript
   * // Manual mode - no automatic progression
   * const manualIntent = handler.handleConversationProgression(
   *   [{ id: "agent-1", enabled: true }, { id: "agent-2", enabled: false }]
   * );
   * // Returns: { toEnable: [], toDisable: [] }
   *
   * // Round robin mode - rotate to next agent
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 }
   * ];
   * const roundRobinIntent = handler.handleConversationProgression(agents);
   * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
   * ```
   */
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent;

  /**
   * Handle removal of an agent from the conversation.
   *
   * Called when an agent is removed from the conversation. The handler
   * determines what state changes are needed to maintain mode-specific
   * behavior after the removal, such as selecting a new enabled agent
   * if the removed agent was currently enabled.
   *
   * Different modes handle this differently:
   * - Manual mode: No automatic changes, preserves current state
   * - Round robin mode: Selects next agent in rotation if removed agent was enabled
   *
   * @param agents - Current conversation agents array after removal (immutable reference)
   * @param removedAgentId - ID of the agent that was removed
   * @returns Intent specifying which agents to enable/disable after removal
   *
   * @example
   * ```typescript
   * // Manual mode - no automatic changes after removal
   * const manualIntent = handler.handleAgentRemoved?.(
   *   [{ id: "agent-2", enabled: false }], // agent-1 was removed
   *   "agent-1"
   * );
   * // Returns: { toEnable: [], toDisable: [] }
   *
   * // Round robin mode - select next agent if removed agent was enabled
   * const remainingAgents = [
   *   { id: "agent-2", enabled: false, display_order: 1 },
   *   { id: "agent-3", enabled: false, display_order: 2 }
   * ];
   * const roundRobinIntent = handler.handleAgentRemoved?.(remainingAgents, "agent-1");
   * // Returns: { toEnable: ["agent-2"], toDisable: [] }
   * ```
   */
  handleAgentRemoved?(
    agents: ConversationAgent[],
    removedAgentId: string,
  ): ChatModeIntent;
}
