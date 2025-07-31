/**
 * SidebarToggleDisplayProps interface for display-only sidebar toggle component.
 *
 * Defines the props contract for the SidebarToggleDisplay component that shows
 * the visual appearance of the sidebar toggle button without interactive functionality.
 * This is a pure display component for component library showcase purposes.
 *
 * @module types/ui/components/SidebarToggleDisplayProps
 */

import React from "react";

/**
 * Props interface for the SidebarToggleDisplay component.
 *
 * This interface defines the properties required for the display-only version
 * of the sidebar toggle button. Unlike the interactive SidebarToggleProps,
 * this version removes all event handlers and focuses purely on visual state
 * representation for component library showcase purposes.
 *
 * @example
 * ```typescript
 * // Basic collapsed state display
 * const collapsedToggleProps: SidebarToggleDisplayProps = {
 *   isCollapsed: true
 * };
 *
 * // Expanded state with hover appearance
 * const expandedHoverProps: SidebarToggleDisplayProps = {
 *   isCollapsed: false,
 *   showHoverState: true,
 *   className: "custom-toggle-styling"
 * };
 *
 * // Custom positioning example
 * const customPositionProps: SidebarToggleDisplayProps = {
 *   isCollapsed: false,
 *   style: {
 *     left: "200px",
 *     top: "45%"
 *   }
 * };
 * ```
 */
export interface SidebarToggleDisplayProps {
  /**
   * Whether the sidebar is visually displayed as collapsed.
   * Controls the visual state of the toggle button, determining the position
   * and the direction of the arrow/chevron icon. Also affects the button's
   * positioning animation state.
   *
   * When true, shows the collapsed state appearance (button positioned for
   * collapsed sidebar). When false, shows the expanded state appearance
   * (button positioned for expanded sidebar).
   *
   * @default false
   */
  isCollapsed?: boolean;

  /**
   * Whether to show the hover appearance state.
   * When true, displays the button with hover styling applied, useful for
   * component library showcase to demonstrate interactive states without
   * actual interactivity.
   *
   * @default false
   */
  showHoverState?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Allows for custom styling of the sidebar toggle display component
   * beyond the default theme-aware styling.
   *
   * Applied to the root element of the sidebar toggle display component.
   *
   * @example "custom-toggle", "showcase-demo", "dark-theme-override"
   */
  className?: string;

  /**
   * Optional inline styles for custom positioning or appearance.
   * Useful for component showcase demonstrations or custom positioning
   * requirements. Styles are applied directly to the toggle button element.
   *
   * @example { left: "200px", top: "45%" }
   */
  style?: React.CSSProperties;
}
