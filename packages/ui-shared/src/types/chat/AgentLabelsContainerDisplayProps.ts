/**
 * Props for AgentLabelsContainerDisplay component.
 * Self-contained top bar layout that internally generates agent pills
 * from agent data with horizontal scrolling and responsive behavior.
 */

import type React from "react";
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
   * Height of the agent labels bar.
   * Controls vertical space allocated for the agent display.
   * @default "56px"
   */
  barHeight?: string | number;

  /**
   * Gap spacing between agent pills.
   * Controls horizontal spacing in the agent list.
   * @default "8px"
   */
  agentSpacing?: string | number;

  /**
   * Horizontal padding inside the container.
   * Affects spacing around the entire agent bar.
   * @default "0 16px"
   */
  containerPadding?: string;

  /**
   * Whether the container supports horizontal scrolling.
   * Enables overflow scrolling when agents exceed container width.
   * @default true
   */
  horizontalScroll?: boolean;

  /**
   * Whether to show the bottom border.
   * Visual separator from the chat area below.
   * @default true
   */
  showBottomBorder?: boolean;

  /**
   * Background color variant for the container.
   * Uses theme color variables for consistent styling.
   * @default "card"
   */
  backgroundVariant?: "card" | "background" | "transparent";

  /**
   * Additional CSS class names for the container.
   */
  className?: string;

  /**
   * Custom styles for the container.
   */
  style?: React.CSSProperties;

  /**
   * ID of the currently selected conversation.
   * Used to load conversation-specific agents and enable/disable the Add Agent button.
   * When null, the Add Agent button should be disabled.
   * @default null
   */
  selectedConversationId?: string | null;
}
