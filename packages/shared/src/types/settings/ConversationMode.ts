/**
 * ConversationMode type for conversation interaction modes.
 *
 * Defines the supported modes for conversation flow control,
 * determining whether conversations proceed manually or automatically.
 *
 * @module types/ConversationMode
 */

export type ConversationMode = "manual" | "auto";

/**
 * Const array of all valid ConversationMode values for runtime validation
 */
export const CONVERSATION_MODE_OPTIONS: readonly ConversationMode[] = [
  "manual",
  "auto",
] as const;
