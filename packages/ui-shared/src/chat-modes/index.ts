/**
 * Chat modes module factory and exports.
 *
 * Provides chat mode implementations, factory functions, and utilities for the
 * strategy pattern architecture. Chat modes control how agents are enabled/disabled
 * during conversations, supporting different interaction patterns while maintaining
 * a consistent interface.
 *
 * @module chat-modes
 */

import type { ChatModeHandler } from "../types/chat-modes/ChatModeHandler";
import { ManualChatMode } from "./ManualChatMode";
import { RoundRobinChatMode } from "./RoundRobinChatMode";

/**
 * Chat mode registry mapping mode names to handler constructors
 */
const CHAT_MODE_REGISTRY = {
  manual: ManualChatMode,
  "round-robin": RoundRobinChatMode,
} as const;

/**
 * Type representing valid chat mode names
 */
export type ChatModeName = keyof typeof CHAT_MODE_REGISTRY;

/**
 * Factory function to create chat mode handler instances
 *
 * Creates appropriate chat mode handler based on the provided mode name.
 * Supports extensible registration of new modes via the registry pattern.
 *
 * @param mode - The chat mode name ("manual" or "round-robin")
 * @returns ChatModeHandler instance for the specified mode
 * @throws Error when mode is not recognized
 *
 * @example
 * ```typescript
 * const manualHandler = createChatModeHandler("manual");
 * const roundRobinHandler = createChatModeHandler("round-robin");
 * ```
 */
export function createChatModeHandler(mode: ChatModeName): ChatModeHandler {
  const HandlerClass = CHAT_MODE_REGISTRY[mode];

  if (!HandlerClass) {
    throw new Error(
      `Unknown chat mode: ${mode}. Supported modes: ${Object.keys(CHAT_MODE_REGISTRY).join(", ")}`,
    );
  }

  return new HandlerClass();
}

/**
 * Get list of all supported chat mode names
 *
 * @returns Array of supported chat mode names
 *
 * @example
 * ```typescript
 * const modes = getSupportedChatModes();
 * // Returns: ["manual", "round-robin"]
 * ```
 */
export function getSupportedChatModes(): ChatModeName[] {
  return Object.keys(CHAT_MODE_REGISTRY) as ChatModeName[];
}

/**
 * Check if a chat mode name is supported
 *
 * @param mode - The mode name to check
 * @returns true if mode is supported, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = isSupportedChatMode("manual"); // true
 * const isInvalid = isSupportedChatMode("unknown"); // false
 * ```
 */
export function isSupportedChatMode(mode: string): mode is ChatModeName {
  return mode in CHAT_MODE_REGISTRY;
}

// Re-export all types and classes for clean imports
export type { ChatModeHandler } from "../types/chat-modes/ChatModeHandler";
export type { ChatModeIntent } from "../types/chat-modes/ChatModeIntent";
export { ManualChatMode } from "./ManualChatMode";
export { RoundRobinChatMode } from "./RoundRobinChatMode";
