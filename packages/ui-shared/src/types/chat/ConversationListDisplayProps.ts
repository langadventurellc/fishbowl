/**
 * Props interface for ConversationListDisplay component.
 *
 * Defines the properties needed to render a conversation list container
 * that holds individual conversation items with proper scrollable layout
 * and visual state support.
 *
 * @module types/ui/components/ConversationListDisplayProps
 */

import type React from "react";
import { ConversationViewModel } from "../ConversationViewModel";
import type { ConversationListScrollState } from "./ConversationListScrollState";

/**
 * Props interface for the ConversationListDisplay component.
 *
 * This component serves as a container for conversation items,
 * providing scrollable layout with proper spacing and visual states
 * for empty, populated, and scrolled appearances.
 *
 * @example
 * ```typescript
 * // Empty state
 * <ConversationListDisplay
 *   conversations={[]}
 *   activeConversationId=""
 *   scrollState="none"
 * />
 *
 * // Populated state
 * <ConversationListDisplay
 *   conversations={conversations}
 *   activeConversationId="active-conversation-name"
 *   scrollState="scrollable"
 * />
 *
 * // Scrolled state (visual only)
 * <ConversationListDisplay
 *   conversations={conversations}
 *   activeConversationId="active-conversation-name"
 *   scrollState="scrolled"
 *   className="custom-styling"
 * />
 * ```
 */
export interface ConversationListDisplayProps {
  /**
   * Array of conversation objects to display in the list.
   * Each conversation will be rendered as an individual item
   * within the scrollable container.
   *
   * Empty array will render the empty state appearance.
   */
  conversations: ConversationViewModel[];

  /**
   * Identifier of the currently active/selected conversation.
   * Used to determine which conversation appears highlighted.
   * Should match the `name` property of one of the conversations.
   *
   * Empty string indicates no active conversation.
   */
  activeConversationId: string;

  /**
   * Visual scroll state of the conversation list container.
   * Controls the appearance of scrolling indicators and layout.
   *
   * - "none": No scrolling, minimal content
   * - "scrollable": Content fits but scroll capability visible
   * - "scrolled": Visual appearance as if content has been scrolled
   */
  scrollState: ConversationListScrollState;

  /**
   * Optional CSS class name for custom styling.
   * Applied to the root container element.
   *
   * @default ""
   */
  className?: string;

  /**
   * Optional inline styles for the container.
   * Custom styles will be merged with the default component styles.
   *
   * @default {}
   */
  style?: React.CSSProperties;
}
