/**
 * ConversationToggleMode union for Manual/Auto functionality toggle states.
 *
 * Defines the supported mode toggle states that control the behavior
 * of the conversation input system between manual and automatic modes.
 *
 * @module types/ui/components/ConversationToggleMode
 */

/**
 * Mode toggle states for Manual/Auto functionality.
 * - "manual": Manual mode where user controls interactions
 * - "auto": Automatic mode with system-driven interactions
 */
export type ConversationToggleMode = "manual" | "auto";
