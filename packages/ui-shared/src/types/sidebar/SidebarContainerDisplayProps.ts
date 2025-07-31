import React from "react";
import { ConversationViewModel } from "../ConversationViewModel";
import { SidebarWidthVariant } from "./SidebarWidthVariant";

/**
 * Props interface for SidebarContainerDisplay component.
 *
 * Defines the configuration interface for the main sidebar layout wrapper component
 * that handles collapsed/expanded visual states with self-contained
 * conversation list rendering.
 *
 * This component provides:
 * - Collapsible width states with smooth transitions
 * - Border and background styling from theme variables
 * - Flexible width variants for different layouts
 * - Self-contained conversation list rendering when conversations prop is provided
 * - Empty sidebar display when no conversations are provided
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
   * Custom styles to apply to the container
   * Merged with component styles, custom styles take precedence
   */
  style?: React.CSSProperties;

  /**
   * Optional conversations array for self-contained sidebar
   * When provided, renders complete sidebar content internally
   * When omitted, renders empty sidebar container
   */
  conversations?: ConversationViewModel[];
}
