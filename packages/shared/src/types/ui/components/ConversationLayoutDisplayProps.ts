/**
 * Props for ConversationLayoutDisplay component.
 * Root layout component that composes sidebar and main content
 * with responsive behavior and layout switching.
 */

import type React from "react";
import type { LayoutVariant } from "./LayoutVariant";

export interface ConversationLayoutDisplayProps {
  /**
   * Sidebar component to display.
   * Contains conversation list and navigation controls.
   */
  sidebar?: React.ReactNode;

  /**
   * Main content panel component.
   * Contains agent labels, chat area, and input controls.
   */
  mainContent?: React.ReactNode;

  /**
   * Whether the sidebar is currently collapsed.
   * Controls sidebar visibility and main content sizing.
   * @default false
   */
  sidebarCollapsed?: boolean;

  /**
   * Layout variant affecting responsive breakpoints.
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Minimum width for the sidebar when expanded.
   * Controls sidebar sizing constraints.
   * @default "200px"
   */
  sidebarMinWidth?: string | number;

  /**
   * Maximum width for the sidebar when expanded.
   * Prevents sidebar from becoming too wide on large screens.
   * @default "300px"
   */
  sidebarMaxWidth?: string | number;

  /**
   * Breakpoint width below which sidebar becomes overlay.
   * Controls responsive behavior on smaller screens.
   * @default "768px"
   */
  responsiveBreakpoint?: string | number;

  /**
   * Whether to show resize handles between panels.
   * Enables user control over panel sizing.
   * @default false
   */
  resizable?: boolean;

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
