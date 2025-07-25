/**
 * Props for MainContentPanelDisplay component.
 * Primary content area that composes agent labels, chat area, and input sections
 * with proper flex layout and overflow handling.
 */

import type React from "react";
import type { LayoutVariant } from "./LayoutVariant";

export interface MainContentPanelDisplayProps {
  /**
   * Agent labels container component to display at the top.
   * Shows active agents with their roles and thinking states.
   */
  agentLabelsContainer?: React.ReactNode;

  /**
   * Chat container component for the main message area.
   * Handles scrollable message display with proper overflow.
   */
  chatContainer?: React.ReactNode;

  /**
   * Input container component for the bottom input area.
   * Contains text input, send button, and mode toggle controls.
   */
  inputContainer?: React.ReactNode;

  /**
   * Layout variant affecting spacing and responsive behavior.
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Whether the panel should show visual borders.
   * Controls border display between panel sections.
   * @default true
   */
  showBorders?: boolean;

  /**
   * Additional CSS class names for the panel container.
   */
  className?: string;

  /**
   * Custom styles for the panel container.
   */
  style?: React.CSSProperties;
}
