/**
 * @fileoverview IPC channel constants for personality definitions operations
 */

export const PERSONALITY_DEFINITIONS_CHANNELS = {
  GET_DEFINITIONS: "personality:get-definitions",
} as const;

export type PersonalityDefinitionsChannelType =
  (typeof PERSONALITY_DEFINITIONS_CHANNELS)[keyof typeof PERSONALITY_DEFINITIONS_CHANNELS];
