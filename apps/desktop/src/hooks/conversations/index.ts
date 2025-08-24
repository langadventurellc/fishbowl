/**
 * @fileoverview Barrel export for conversation hooks
 *
 * This file provides a clean import interface for all conversation-related React hooks
 * used throughout the desktop application. These hooks handle conversation CRUD operations
 * and provide reactive state management for the UI components.
 *
 * @example
 * ```typescript
 * // Import hooks
 * import { useConversations, useCreateConversation, useConversation } from '@/hooks/conversations';
 *
 * function ConversationComponent() {
 *   const { conversations, isLoading } = useConversations();
 *   const { createConversation, isCreating } = useCreateConversation();
 *   const { conversation } = useConversation(conversationId);
 *
 *   // ... component logic
 * }
 * ```
 */

// Conversation management hooks
export { useConversations } from "./useConversations";
export { useCreateConversation } from "./useCreateConversation";
export { useConversation } from "./useConversation";
