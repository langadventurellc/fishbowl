/**
 * Chat store barrel exports.
 *
 * Provides clean exports for the chat store module including the main
 * store hook and TypeScript interface for transient UI state management.
 *
 * @module stores/chat
 */

export { useChatStore } from "./useChatStore";
export type { ChatStore } from "./useChatStore";
export type { AgentError } from "./AgentError";
