/**
 * Props interface for ConversationItemDisplay component.
 *
 * Defines the properties needed to render a conversation item display component
 * that shows individual conversation entries with visual states for active,
 * inactive, unread, and hover appearances without interactive functionality.
 *
 * @module types/ui/components/ConversationItemDisplayProps
 */

import type React from "react";
import { ConversationViewModel } from "src/types/ConversationViewModel";

/**
 * Props interface for the ConversationItemDisplay component.
 *
 * This interface defines a display-only version of conversation item props,
 * focusing on visual representation without interactive handlers. Used for
 * showcasing conversation item appearance and visual states.
 *
 * @example
 * ```typescript
 * // Active conversation item
 * <ConversationItemDisplay
 *   conversation={{
 *     name: "Project Planning",
 *     lastActivity: "2h ago",
 *     isActive: true
 *   }}
 *   showUnreadIndicator={true}
 *   appearanceState="active"
 * />
 *
 * // Inactive conversation with hover appearance
 * <ConversationItemDisplay
 *   conversation={{
 *     name: "Creative Writing",
 *     lastActivity: "Yesterday",
 *     isActive: false
 *   }}
 *   appearanceState="hover"
 *   className="custom-styling"
 * />
 *
 * // Unread conversation item
 * <ConversationItemDisplay
 *   conversation={{
 *     name: "Code Review",
 *     lastActivity: "Dec 15",
 *     isActive: false
 *   }}
 *   showUnreadIndicator={true}
 *   appearanceState="unread"
 * />
 * ```
 */
export interface ConversationItemDisplayProps {
  /**
   * The conversation data to display.
   * Contains all necessary information for rendering the conversation item
   * including name, last activity timestamp, and current selection state.
   *
   * The isActive property from the conversation will be used alongside
   * appearanceState to determine the final visual appearance.
   */
  conversation: ConversationViewModel;

  /**
   * Visual appearance state for the conversation item.
   * Controls the styling and visual feedback shown to the user.
   *
   * - "active": Currently selected conversation (highlighted background)
   * - "inactive": Normal unselected conversation (muted appearance)
   * - "hover": Appearance when hovering over the item (without actual hover behavior)
   * - "unread": Conversation with unread messages (enhanced visibility)
   *
   * @default "inactive"
   */
  appearanceState?: "active" | "inactive" | "hover" | "unread";

  /**
   * Whether to show the unread indicator dot.
   * When true, displays a visual indicator that the conversation has unread messages.
   * The indicator appearance is styled according to the current theme.
   *
   * @default false
   */
  showUnreadIndicator?: boolean;

  /**
   * Optional CSS class name for custom styling.
   * Applied to the root element of the conversation item component.
   *
   * @default ""
   */
  className?: string;

  /**
   * Optional inline styles for the conversation item.
   * Custom styles will be merged with the default component styles,
   * with custom styles taking precedence.
   *
   * @default {}
   */
  style?: React.CSSProperties;
}
