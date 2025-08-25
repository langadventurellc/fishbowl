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
