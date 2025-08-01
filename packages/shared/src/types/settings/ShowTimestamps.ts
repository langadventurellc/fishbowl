/**
 * ShowTimestamps type for timestamp display options.
 *
 * Defines the supported modes for displaying timestamps in conversations,
 * allowing users to control when message timestamps are visible.
 *
 * @module types/ShowTimestamps
 */

export type ShowTimestamps = "always" | "hover" | "never";

/**
 * Const array of all valid ShowTimestamps values for runtime validation
 */
export const SHOW_TIMESTAMPS_OPTIONS: readonly ShowTimestamps[] = [
  "always",
  "hover",
  "never",
] as const;
