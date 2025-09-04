/**
 * ManualChatMode implementation for chat mode strategy pattern.
 *
 * Provides complete user control over agent enabled/disabled state with no
 * automatic behavior. Preserves the current application behavior where users
 * have full manual control over which agents participate in conversations.
 *
 * @module chat-modes/ManualChatMode
 */

import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeHandler } from "../types/chat-modes/ChatModeHandler";
import type { ChatModeIntent } from "../types/chat-modes/ChatModeIntent";

/**
 * Manual chat mode implementation.
 *
 * Provides complete user control over agent enabled/disabled state.
 * All operations return empty intents, preserving existing application behavior
 * where users manually control which agents are active in conversations.
 *
 * Key characteristics:
 * - No automatic agent enabling/disabling
 * - Preserves backward compatibility with existing workflows
 * - Respects all user decisions without interference
 * - High performance with minimal computational overhead
 *
 * @example
 * ```typescript
 * const mode = new ManualChatMode();
 *
 * // Adding a new agent - no automatic changes
 * const intent = mode.handleAgentAdded(agents, "new-agent-id");
 * // Returns: { toEnable: [], toDisable: [] }
 *
 * // User toggling agent - respects user choice
 * const toggleIntent = mode.handleAgentToggle(agents, "agent-id");
 * // Returns: { toEnable: [], toDisable: [] }
 *
 * // Conversation progression - no automatic rotation
 * const progressIntent = mode.handleConversationProgression(agents);
 * // Returns: { toEnable: [], toDisable: [] }
 * ```
 */
export class ManualChatMode implements ChatModeHandler {
  /**
   * The name of this chat mode.
   *
   * Used for mode identification and debugging. Consistent across all
   * instances of ManualChatMode.
   */
  readonly name = "manual";

  /**
   * Handle agent addition - no automatic behavior in manual mode.
   *
   * When a new agent is added to the conversation, manual mode makes no
   * automatic decisions about enabling or disabling agents. Users retain
   * complete control over agent participation.
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @param newAgentId - ID of newly added agent (unused in manual mode)
   * @returns Empty intent - no automatic changes
   *
   * @example
   * ```typescript
   * const mode = new ManualChatMode();
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 }
   * ];
   *
   * const intent = mode.handleAgentAdded(agents, "agent-3");
   * // Returns: { toEnable: [], toDisable: [] }
   * // User must manually enable agent-3 if desired
   * ```
   */
  handleAgentAdded(
    _agents: ConversationAgent[],
    _newAgentId: string,
  ): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle agent toggle - no automatic behavior in manual mode.
   *
   * When a user manually toggles an agent's enabled state, manual mode
   * makes no additional automatic adjustments. The user's choice is
   * respected without interference.
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @param toggledAgentId - ID of toggled agent (unused in manual mode)
   * @returns Empty intent - no automatic changes
   *
   * @example
   * ```typescript
   * const mode = new ManualChatMode();
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 }
   * ];
   *
   * // User toggles agent-2 on
   * const intent = mode.handleAgentToggle(agents, "agent-2");
   * // Returns: { toEnable: [], toDisable: [] }
   * // Both agent-1 and agent-2 can be enabled simultaneously
   * ```
   */
  handleAgentToggle(
    _agents: ConversationAgent[],
    _toggledAgentId: string,
  ): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle conversation progression - no automatic behavior in manual mode.
   *
   * After an agent completes a response, manual mode makes no automatic
   * decisions about which agents should participate in the next turn.
   * Users control conversation flow manually.
   *
   * @param agents - Current conversation agents (unused in manual mode)
   * @returns Empty intent - no automatic changes
   *
   * @example
   * ```typescript
   * const mode = new ManualChatMode();
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 },
   *   { id: "agent-3", enabled: false, display_order: 2 }
   * ];
   *
   * // After agent-1 responds
   * const intent = mode.handleConversationProgression(agents);
   * // Returns: { toEnable: [], toDisable: [] }
   * // agent-1 remains enabled, user decides what's next
   * ```
   */
  handleConversationProgression(_agents: ConversationAgent[]): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle removal of an agent from the conversation.
   *
   * In Manual mode, agent removal does not trigger automatic state changes.
   * Users maintain full control over which agents are enabled or disabled,
   * so removing an agent simply preserves the current state of remaining agents.
   *
   * @param _agents - Current conversation agents after removal (unused in manual mode)
   * @param _removedAgentId - ID of the agent that was removed (unused in manual mode)
   * @returns Empty intent indicating no automatic changes
   *
   * @example
   * ```typescript
   * const mode = new ManualChatMode();
   * const remainingAgents = [
   *   { id: "agent-2", enabled: false },
   *   { id: "agent-3", enabled: true }
   * ];
   * const intent = mode.handleAgentRemoved(remainingAgents, "agent-1");
   * // Returns: { toEnable: [], toDisable: [] }
   * // No automatic changes - user maintains control
   * ```
   */
  handleAgentRemoved(
    _agents: ConversationAgent[],
    _removedAgentId: string,
  ): ChatModeIntent {
    return { toEnable: [], toDisable: [] };
  }
}
