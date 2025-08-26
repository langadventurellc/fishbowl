/**
 * Props for MainContentPanelDisplay component.
 * Primary content area that composes agent labels, chat area, and input sections
 * with proper flex layout and overflow handling.
 */

import type React from "react";

export interface MainContentPanelDisplayProps {
  /**
   * Currently selected conversation ID.
   * Used to track which conversation is active for agent management.
   */
  selectedConversationId?: string | null;

  /**
   * Additional CSS class names for the panel container.
   */
  className?: string;

  /**
   * Custom styles for the panel container.
   */
  style?: React.CSSProperties;
}
