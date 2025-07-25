/**
 * Visual states for the conversation list container.
 * Used to control the appearance of the list based on content and interaction.
 *
 * @module types/ui/components/ConversationListScrollState
 */

/**
 * Visual scroll state of the conversation list container.
 * Controls the appearance of scrolling indicators and layout.
 *
 * - "none": No scrolling, minimal content
 * - "scrollable": Content fits but scroll capability visible
 * - "scrolled": Visual appearance as if content has been scrolled
 */
export type ConversationListScrollState = "none" | "scrollable" | "scrolled";
