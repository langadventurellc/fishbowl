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
 * import { useMessages } from '@/hooks/messages';
 *
 * function MessagesComponent({ conversationId }: { conversationId: string }) {
 *   const { messages, isLoading, error, refetch, isEmpty } = useMessages(conversationId);
 *
 *   // ... component logic
 * }
 * ```
 */

// Message management hooks
export { useMessages } from "./useMessages";
