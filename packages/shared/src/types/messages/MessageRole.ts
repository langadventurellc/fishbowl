/**
 * Message role constants
 */
export const MessageRole = {
  USER: "user",
  AGENT: "agent",
  SYSTEM: "system",
} as const;

/**
 * Message role type
 */
export type MessageRoleType = (typeof MessageRole)[keyof typeof MessageRole];
