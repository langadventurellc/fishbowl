/**
 * Props for ConversationScreenDisplay component.
 * Root layout component that provides the overall screen structure
 * with theme support and responsive behavior.
 */

import type React from "react";
import type { LayoutVariant } from "./LayoutVariant";
import type { ThemeMode } from "../theme/ThemeMode";

export interface ConversationScreenDisplayProps {
  /**
   * Current theme mode for the screen.
   * Controls overall color scheme and visual styling.
   * @default "light"
   */
  themeMode?: ThemeMode;

  /**
   * Layout variant to use for screen composition.
   * Affects spacing, sizing, and responsive breakpoints.
   * @default "default"
   */
  layoutVariant?: LayoutVariant;

  /**
   * Whether the screen should fill the full viewport.
   * When true, applies 100vh height and handles overflow.
   * @default true
   */
  fullScreen?: boolean;

  /**
   * Child content to render within the screen layout.
   * Typically contains sidebar and main content panel components.
   */
  children: React.ReactNode;

  /**
   * Additional CSS class names to apply to the root container.
   * Merged with component classes for custom styling.
   */
  className?: string;

  /**
   * Custom styles to apply to the root container.
   * Merged with component styles, custom styles take precedence.
   */
  style?: React.CSSProperties;

  /**
   * Handler for global click events on the screen.
   * Useful for closing open menus or modals when clicking outside.
   */
  onClick?: () => void;
}
