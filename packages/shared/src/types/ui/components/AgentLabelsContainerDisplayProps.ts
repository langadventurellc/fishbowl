/**
 * Props for AgentLabelsContainerDisplay component.
 * Top bar layout for displaying active agent pills with horizontal
 * scrolling and responsive behavior.
 */

import type React from "react";

export interface AgentLabelsContainerDisplayProps {
  /**
   * Array of agent pill components to display.
   * Each agent should be rendered as an AgentPill component.
   */
  agentPills?: React.ReactNode[];

  /**
   * Additional action buttons or controls to display.
   * Typically includes add agent button and theme toggle.
   */
  actionButtons?: React.ReactNode[];

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
}
