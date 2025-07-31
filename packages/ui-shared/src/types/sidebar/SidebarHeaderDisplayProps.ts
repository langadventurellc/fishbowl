import React from "react";

/**
 * Props interface for SidebarHeaderDisplay component.
 *
 * Defines the configuration interface for the sidebar header component that displays
 * the top section with title and controls.
 *
 * This component provides pure visual display of sidebar header styling including:
 * - Title text display with consistent typography
 * - Show/hide controls visual states
 * - Collapsed state visibility handling
 * - Theme variable integration for consistent styling
 *
 * @module types/ui/components/SidebarHeaderDisplayProps
 */

/**
 * Props interface for SidebarHeaderDisplay component
 */
export interface SidebarHeaderDisplayProps {
  /**
   * Title text to display in the sidebar header
   * @default "Conversations"
   */
  title?: string;

  /**
   * Whether to show controls in the header area
   * @default true
   */
  showControls?: boolean;

  /**
   * Whether the sidebar is in collapsed state
   * When collapsed, the header may be hidden or styled differently
   * @default false
   */
  collapsed?: boolean;

  /**
   * Additional CSS class names to apply to the header container
   * @default ""
   */
  className?: string;

  /**
   * Custom styles to apply to the header container
   * Merged with component styles, custom styles take precedence
   */
  style?: React.CSSProperties;
}
