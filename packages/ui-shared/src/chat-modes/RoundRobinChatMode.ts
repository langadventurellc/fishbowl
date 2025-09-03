/**
 * RoundRobinChatMode implementation for chat mode strategy pattern.
 *
 * Manages single-agent-enabled rotation logic where only one agent is enabled
 * at a time, with automatic progression after agent responses in deterministic
 * order based on display_order and added_at timestamp.
 *
 * @module chat-modes/RoundRobinChatMode
 */

import type { ConversationAgent } from "@fishbowl-ai/shared";
import type { ChatModeHandler } from "../types/chat-modes/ChatModeHandler";
import type { ChatModeIntent } from "../types/chat-modes/ChatModeIntent";

/**
 * Round Robin chat mode implementation.
 *
 * Manages single-agent-enabled rotation logic where only one agent
 * is enabled at a time, with automatic progression after responses.
 * Ensures deterministic agent ordering using display_order (ascending)
 * then added_at timestamp (ascending).
 *
 * Key characteristics:
 * - Single agent enabled invariant maintained across all operations
 * - Automatic rotation after conversation progression
 * - Deterministic ordering: display_order ASC, then added_at ASC
 * - Manual overrides supported with proper state transitions
 * - High performance with <10ms completion for 50 agents
 * - Immutable operations - never modifies input arrays
 *
 * @example
 * ```typescript
 * const mode = new RoundRobinChatMode();
 *
 * // First agent addition - automatically enabled
 * const intent1 = mode.handleAgentAdded([], "agent-1");
 * // Returns: { toEnable: ["agent-1"], toDisable: [] }
 *
 * // Subsequent agents - preserve current enabled agent
 * const agents = [{ id: "agent-1", enabled: true, display_order: 0 }];
 * const intent2 = mode.handleAgentAdded(agents, "agent-2");
 * // Returns: { toEnable: [], toDisable: [] }
 *
 * // Manual toggle - maintain single-enabled invariant
 * const toggleIntent = mode.handleAgentToggle(agents, "agent-2");
 * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
 *
 * // Conversation progression - rotate to next agent
 * const progressIntent = mode.handleConversationProgression(agents);
 * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
 * ```
 */
export class RoundRobinChatMode implements ChatModeHandler {
  /**
   * The name of this chat mode.
   *
   * Used for mode identification and factory creation. Consistent across
   * all instances of RoundRobinChatMode.
   */
  readonly name = "round-robin";

  /**
   * Handle agent addition - enable first agent, preserve current for others.
   *
   * When the first agent is added to an empty conversation, it is automatically
   * enabled to ensure at least one agent is ready to participate. For subsequent
   * agent additions, the current enabled agent is preserved to maintain the
   * single-enabled invariant without disrupting ongoing conversations.
   *
   * @param agents - Current conversation agents array
   * @param newAgentId - ID of newly added agent
   * @returns Intent to enable first agent or maintain current state
   *
   * @example
   * ```typescript
   * const mode = new RoundRobinChatMode();
   *
   * // Empty conversation - enable first agent
   * const emptyIntent = mode.handleAgentAdded([], "agent-1");
   * // Returns: { toEnable: ["agent-1"], toDisable: [] }
   *
   * // Existing agents - preserve current enabled
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 }
   * ];
   * const addIntent = mode.handleAgentAdded(agents, "agent-3");
   * // Returns: { toEnable: [], toDisable: [] }
   * ```
   */
  handleAgentAdded(
    agents: ConversationAgent[],
    newAgentId: string,
  ): ChatModeIntent {
    const enabledAgents = agents.filter((agent) => agent.enabled);

    // First agent: enable it
    if (enabledAgents.length === 0) {
      return { toEnable: [newAgentId], toDisable: [] };
    }

    // Subsequent agents: preserve current enabled agent
    return { toEnable: [], toDisable: [] };
  }

  /**
   * Handle agent toggle - maintain single-enabled invariant.
   *
   * When a user manually toggles an agent, Round Robin mode ensures only one
   * agent remains enabled at any time. Disabling the current enabled agent
   * leaves no agents enabled until the user enables another. Enabling a different
   * agent automatically disables the current one to maintain the invariant.
   *
   * @param agents - Current conversation agents array
   * @param toggledAgentId - ID of agent being toggled
   * @returns Intent to maintain single-enabled state
   *
   * @example
   * ```typescript
   * const mode = new RoundRobinChatMode();
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0 },
   *   { id: "agent-2", enabled: false, display_order: 1 }
   * ];
   *
   * // Disable current enabled agent
   * const disableIntent = mode.handleAgentToggle(agents, "agent-1");
   * // Returns: { toEnable: [], toDisable: ["agent-1"] }
   *
   * // Enable different agent - disable current
   * const switchIntent = mode.handleAgentToggle(agents, "agent-2");
   * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
   * ```
   */
  handleAgentToggle(
    agents: ConversationAgent[],
    toggledAgentId: string,
  ): ChatModeIntent {
    const toggledAgent = agents.find((agent) => agent.id === toggledAgentId);
    if (!toggledAgent) {
      // Invalid agent ID - no changes
      return { toEnable: [], toDisable: [] };
    }

    const currentEnabledAgent = agents.find((agent) => agent.enabled);

    if (toggledAgent.enabled) {
      // Disabling current enabled agent
      return { toEnable: [], toDisable: [toggledAgentId] };
    } else {
      // Enabling different agent - disable current, enable new
      if (currentEnabledAgent) {
        return {
          toEnable: [toggledAgentId],
          toDisable: [currentEnabledAgent.id],
        };
      } else {
        return { toEnable: [toggledAgentId], toDisable: [] };
      }
    }
  }

  /**
   * Handle conversation progression - rotate to next agent.
   *
   * After an agent completes a response, automatically rotates to the next
   * agent in the sequence. Agents are sorted by display_order (ascending)
   * then added_at timestamp (ascending) for deterministic, predictable
   * rotation. Wraps around from the last agent to the first.
   *
   * Single agent conversations and empty arrays return no-op intents to
   * avoid unnecessary state changes.
   *
   * @param agents - Current conversation agents array
   * @returns Intent to rotate to next agent in sequence
   *
   * @example
   * ```typescript
   * const mode = new RoundRobinChatMode();
   * const agents = [
   *   { id: "agent-1", enabled: true, display_order: 0, added_at: "2024-01-01T00:00:00Z" },
   *   { id: "agent-2", enabled: false, display_order: 1, added_at: "2024-01-01T00:01:00Z" },
   *   { id: "agent-3", enabled: false, display_order: 2, added_at: "2024-01-01T00:02:00Z" }
   * ];
   *
   * // Rotate from agent-1 to agent-2
   * const intent = mode.handleConversationProgression(agents);
   * // Returns: { toEnable: ["agent-2"], toDisable: ["agent-1"] }
   *
   * // When agent-3 is current, wraps to agent-1
   * const agents2 = [...agents];
   * agents2[0].enabled = false;
   * agents2[2].enabled = true;
   * const wrapIntent = mode.handleConversationProgression(agents2);
   * // Returns: { toEnable: ["agent-1"], toDisable: ["agent-3"] }
   * ```
   */
  handleConversationProgression(agents: ConversationAgent[]): ChatModeIntent {
    if (agents.length <= 1) {
      // Single agent or empty - no rotation needed
      return { toEnable: [], toDisable: [] };
    }

    // Sort agents by display_order then added_at for deterministic order
    const sortedAgents = agents.slice().sort((a, b) => {
      const orderDiff = a.display_order - b.display_order;
      if (orderDiff !== 0) return orderDiff;

      return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
    });

    const currentEnabledIndex = sortedAgents.findIndex(
      (agent) => agent.enabled,
    );
    if (currentEnabledIndex === -1) {
      // No enabled agents - no rotation
      return { toEnable: [], toDisable: [] };
    }

    // Calculate next agent index (wrap around)
    const nextIndex = (currentEnabledIndex + 1) % sortedAgents.length;
    const currentAgent = sortedAgents[currentEnabledIndex]!;
    const nextAgent = sortedAgents[nextIndex]!;

    return {
      toEnable: [nextAgent.id],
      toDisable: [currentAgent.id],
    };
  }
}
