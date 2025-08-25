import React from "react";

/**
 * Props interface for SidebarContainerDisplay component
 */
export interface SidebarContainerDisplayProps {
  /**
   * Whether the sidebar is in collapsed state
   * @default false
   */
  collapsed?: boolean;

  /**
   * Whether to show the right border
   * @default true
   */
  showBorder?: boolean;

  /**
   * Currently selected conversation ID.
   * Used to track which conversation is active for agent management.
   */
  selectedConversationId?: string | null;

  /**
   * Handler for conversation selection changes.
   * Called when user selects a different conversation in the sidebar.
   */
  onConversationSelect?: (conversationId: string | null) => void;

  /**
   * Additional CSS class names to apply to the container
   * @default ""
   */
  className?: string;

  /**
   * Custom styles to apply to the container
   * Merged with component styles, custom styles take precedence
   */
  style?: React.CSSProperties;
}
