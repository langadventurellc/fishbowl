/**
 * Props for ChatContainerDisplay component.
 * Scrollable message area layout with proper overflow handling
 * and message spacing configuration.
 */

import type React from "react";
import { MessageViewModel } from "../MessageViewModel";

export interface ChatContainerDisplayProps {
  /**
   * Array of message data to display.
   * Component will automatically create MessageItem components for each message.
   */
  messages?: MessageViewModel[];

  /**
   * Handler for context menu actions on messages.
   * Called when user selects an action from a message's context menu.
   *
   * @param action - The selected action identifier
   * @param messageId - The ID of the message the action was performed on
   */
  onContextMenuAction?: (action: string, messageId: string) => void;

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

  /**
   * Callback to receive imperative scroll methods from the container.
   * Provides access to scrollToBottomIfPinned method for deterministic scrolling.
   */
  onScrollMethods?: (methods: {
    scrollToBottomIfPinned: (threshold?: number) => boolean;
  }) => void;
}
