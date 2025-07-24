/**
 * Agent interface for conversation UI system.
 *
 * Represents an AI agent participant in the conversation with
 * properties for identification, visual presentation, and state.
 *
 * @module types/ui/core/Agent
 */

/**
 * Represents an AI agent participant in the conversation UI system.
 *
 * This interface defines the structure for agent entities displayed in the
 * agent pills bar, including their visual theming, role information, and
 * current thinking state for real-time feedback.
 *
 * @example
 * ```typescript
 * const technicalAdvisor: Agent = {
 *   name: "Technical Advisor",
 *   role: "Technical Advisor",
 *   color: "#3b82f6",
 *   isThinking: false
 * };
 *
 * const projectManager: Agent = {
 *   name: "Project Manager",
 *   role: "Project Manager",
 *   color: "#22c55e",
 *   isThinking: true  // Shows pulsing dot animation
 * };
 *
 * const creativeDirector: Agent = {
 *   name: "Creative Director",
 *   role: "Creative Director",
 *   color: "#a855f7",
 *   isThinking: false
 * };
 * ```
 */
export interface Agent {
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
   */
  isThinking: boolean;
}
