/**
 * Props for AgentLabelsContainerDisplay component.
 * Self-contained top bar layout that internally generates agent pills
 * from agent data with horizontal scrolling and responsive behavior.
 */

import { AgentPillViewModel } from "./AgentPillViewModel";

export interface AgentLabelsContainerDisplayProps {
  /**
   * Array of agent data to display as pills.
   * Component internally creates AgentPill components from this data.
   */
  agents: AgentPillViewModel[];

  /**
   * Optional callback for the built-in "Add New Agent" button.
   * When provided, displays an "Add Agent" button that calls this function.
   */
  onAddAgent?: () => void;

  /**
   * Additional CSS class names for the container.
   */
  className?: string;

  /**
   * ID of the currently selected conversation.
   * Used to load conversation-specific agents and enable/disable the Add Agent button.
   * When null, the Add Agent button should be disabled.
   * @default null
   */
  selectedConversationId?: string | null;
}
