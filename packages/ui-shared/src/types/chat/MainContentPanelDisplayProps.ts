/**
 * Props for MainContentPanelDisplay component.
 * Primary content area that composes agent labels, chat area, and input sections
 * with proper flex layout and overflow handling.
 */

import type React from "react";

export interface MainContentPanelDisplayProps {
  /**
   * Additional CSS class names for the panel container.
   */
  className?: string;

  /**
   * Custom styles for the panel container.
   */
  style?: React.CSSProperties;
}
