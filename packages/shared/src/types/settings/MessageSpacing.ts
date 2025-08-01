/**
 * MessageSpacing type for message display spacing options.
 *
 * Defines the supported spacing modes for message display in conversations,
 * allowing users to customize the visual density of the chat interface.
 *
 * @module types/MessageSpacing
 */

export type MessageSpacing = "compact" | "normal" | "relaxed";

/**
 * Const array of all valid MessageSpacing values for runtime validation
 */
export const MESSAGE_SPACING_OPTIONS: readonly MessageSpacing[] = [
  "compact",
  "normal",
  "relaxed",
] as const;
