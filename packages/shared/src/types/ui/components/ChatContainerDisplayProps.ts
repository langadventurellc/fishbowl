/**
 * Props for ChatContainerDisplay component.
 * Scrollable message area layout with proper overflow handling
 * and message spacing configuration.
 */

import type React from "react";

export interface ChatContainerDisplayProps {
  /**
   * Array of message components to display.
   * Each message should be a complete MessageItem component.
   */
  messages?: React.ReactNode[];

  /**
   * Whether the container should auto-scroll to the bottom.
   * Useful for keeping latest messages visible.
   * @default true
   */
  autoScroll?: boolean;

  /**
   * Maximum height for the scrollable area.
   * When content exceeds this, vertical scrolling is enabled.
   */
  maxHeight?: string | number;

  /**
   * Gap spacing between message items.
   * Controls vertical spacing in the message list.
   * @default "12px"
   */
  messageSpacing?: string | number;

  /**
   * Padding applied inside the scrollable container.
   * Affects spacing around the entire message area.
   * @default "16px 24px"
   */
  containerPadding?: string;

  /**
   * Content to display when no messages are present.
   * Provides empty state UI for new conversations.
   */
  emptyState?: React.ReactNode;

  /**
   * Whether to show scroll indicators.
   * Visual hints for scrollable content.
   * @default false
   */
  showScrollIndicators?: boolean;

  /**
   * Additional CSS class names for the container.
   */
  className?: string;

  /**
   * Custom styles for the container.
   */
  style?: React.CSSProperties;

  /**
   * Handler for scroll events in the container.
   * Useful for implementing scroll-based features.
   */
  onScroll?: () => void;
}
