/**
 * MessageType union for conversation UI system.
 *
 * Defines the supported message types that determine visual styling and behavior
 * of messages in the conversation interface.
 *
 * @module types/ui/core/MessageType
 */

/**
 * The type of message, determining visual styling and behavior.
 * - "user": Messages from the human user (right-aligned, accent color)
 * - "agent": Messages from AI agents (left-aligned, standard styling)
 * - "system": System notifications (center-aligned, muted styling)
 */
export type MessageType = "user" | "agent" | "system";
