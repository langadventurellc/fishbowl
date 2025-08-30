import type { AgentError } from "../../stores/chat/AgentError";

/**
 * AgentPillViewModel interface for conversation UI system.
 */
export interface AgentPillViewModel {
  /**
   * Display name of the AI agent.
   * Used in agent pills, message headers, and throughout the UI
   * for agent identification and visual association.
   *
   * @example "Technical Advisor", "Project Manager", "Creative Director"
   */
  name: string;

  /**
   * Role or specialty of the AI agent.
   * Provides context about the agent's expertise and responsibilities.
   * Usually matches the name but can be more specific or descriptive.
   *
   * @example "Technical Advisor", "Senior Project Manager", "UX Designer"
   */
  role: string;

  /**
   * Hex color code for the agent's visual theming.
   * Used for agent pills background, message association, and visual
   * consistency throughout the conversation interface.
   * Should be a valid CSS hex color value.
   *
   * @example "#3b82f6" (blue), "#22c55e" (green), "#a855f7" (purple)
   */
  color: string;

  /**
   * Whether the agent is currently processing or "thinking".
   * When true, displays a pulsing dot animation in the agent pill
   * to provide visual feedback that the agent is active.
   *
   * Used for real-time state indication during agent processing.
   *
   * @deprecated Use `status` property instead. Maintained for backward compatibility.
   */
  isThinking: boolean;

  /**
   * Current agent processing state.
   * Provides rich status information for real-time UI feedback.
   * Replaces the simple boolean `isThinking` with more granular states.
   *
   * @example
   * - 'idle': Agent is not processing
   * - 'thinking': Agent is actively processing a request
   * - 'complete': Agent has finished processing successfully
   * - 'error': Agent encountered an error during processing
   */
  status: "idle" | "thinking" | "complete" | "error";

  /**
   * Agent-specific error information when status is 'error'.
   * Contains structured error data including user-friendly messages,
   * error types, and retry capabilities.
   *
   * Should be null or undefined when status is not 'error'.
   */
  error?: AgentError | null;

  /**
   * Whether the agent is enabled for new conversations.
   * When false, the agent pill should display with reduced opacity
   * and visual indicators showing it's disabled.
   *
   * Used to control agent participation in conversation generation.
   */
  enabled: boolean;
}
