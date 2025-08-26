/**
 * Props for ConversationLayoutDisplay component.
 * Root layout component that composes sidebar and main content
 * with responsive behavior and layout switching.
 */

import type React from "react";

export interface ConversationLayoutDisplayProps {
  /**
   * Initial collapsed state for the sidebar.
   * Controls the default sidebar visibility when component first mounts.
   * @default false
   */
  defaultSidebarCollapsed?: boolean;

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
   * Handler for sidebar collapse/expand toggle.
   * Called when sidebar visibility changes.
   */
  onSidebarToggle?: (collapsed: boolean) => void;

  /**
   * Handler for sidebar resize events.
   * Called when user adjusts sidebar width.
   */
  onSidebarResize?: (width: number) => void;

  /**
   * Additional CSS class names for the layout container.
   */
  className?: string;

  /**
   * Custom styles for the layout container.
   */
  style?: React.CSSProperties;
}
