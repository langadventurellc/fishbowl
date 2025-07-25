import React from "react";
import { SidebarWidthVariant } from "./SidebarWidthVariant";

/**
 * Props interface for SidebarContainerDisplay component.
 *
 * Defines the configuration interface for the main sidebar layout wrapper component
 * that handles collapsed/expanded visual states extracted from DesignPrototype.tsx lines 258-267.
 *
 * This component provides pure visual display of sidebar container styling including:
 * - Collapsible width states with smooth transitions
 * - Border and background styling from theme variables
 * - Flexible width variants for different layouts
 *
 * @module types/ui/components/SidebarContainerDisplayProps
 */

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
   * Width variant to use when sidebar is expanded
   * @default "default"
   */
  widthVariant?: SidebarWidthVariant;

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
   * Child content to render inside the sidebar container
   */
  children?: React.ReactNode;

  /**
   * Custom styles to apply to the container
   * Merged with component styles, custom styles take precedence
   */
  style?: React.CSSProperties;
}
