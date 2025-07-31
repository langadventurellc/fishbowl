/**
 * AgentPillProps interface for agent display component.
 *
 * Defines the props contract for the AgentPill component that displays
 * agent information with color coding, role display, and thinking state.
 *
 * @module types/ui/components/AgentPillProps
 */

import { AgentViewModel } from "../AgentViewModel";

/**
 * Props interface for the AgentPill component.
 *
 * This interface defines the properties required for displaying an agent pill
 * in the conversation UI, including the agent information, visual state, and
 * interaction handlers for user events.
 *
 * @example
 * ```typescript
 * const agentPillProps: AgentPillProps = {
 *   agent: {
 *     name: "Technical Advisor",
 *     role: "Technical Advisor",
 *     color: "#3b82f6",
 *     isThinking: false
 *   },
 *   onClick: (agentName) => {
 *     console.log(`Clicked on agent: ${agentName}`);
 *   },
 *   className: "custom-agent-pill"
 * };
 *
 * // With thinking state active
 * const thinkingAgentProps: AgentPillProps = {
 *   agent: {
 *     name: "Project Manager",
 *     role: "Project Manager",
 *     color: "#22c55e",
 *     isThinking: true // Shows pulsing animation
 *   }
 * };
 * ```
 */
export interface AgentPillProps {
  /**
   * The agent data to display in the pill component.
   * Contains all necessary information for rendering the agent including
   * name, role, color theming, and current thinking state.
   *
   * The agent's color property is used for the pill's background color,
   * and the isThinking property controls the display of the pulsing
   * thinking indicator animation.
   */
  agent: AgentViewModel;

  /**
   * Optional click handler for agent pill interactions.
   * Called when the user clicks on the agent pill, receiving the
   * agent's name as a parameter for identification.
   *
   * Useful for implementing agent selection, detail views, or
   * other interactive behaviors.
   *
   * @param agentName - The name of the clicked agent
   */
  onClick?: (agentName: string) => void;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the agent pill component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the agent pill component.
   *
   * @example "custom-agent-pill", "highlighted", "small-pill"
   */
  className?: string;
}
