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
