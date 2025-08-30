/**
 * @fileoverview Barrel export for message hooks
 *
 * This file provides a clean import interface for all message-related React hooks
 * used throughout the desktop application. These hooks handle message CRUD operations
 * and provide reactive state management for the UI components.
 *
 * @example
 * ```typescript
 * // Import hooks
 * import { useMessages, useCreateMessage, useUpdateMessage } from '@/hooks/messages';
 *
 * function MessagesComponent({ conversationId }: { conversationId: string }) {
 *   const { messages, isLoading, error, refetch, isEmpty } = useMessages(conversationId);
 *   const { createMessage, sending, error: createError } = useCreateMessage();
 *   const { updateInclusion, updating, error: updateError } = useUpdateMessage();
 *
 *   // ... component logic
 * }
 * ```
 */

// Message management hooks
export { useMessages } from "./useMessages";
export { useCreateMessage } from "./useCreateMessage";
export { useUpdateMessage } from "./useUpdateMessage";
export { useMessagesWithAgentData } from "./useMessagesWithAgentData";
