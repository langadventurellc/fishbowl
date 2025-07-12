/**
 * Context data for message active state errors in IPC operations
 */
export interface MessageActiveStateErrorContext {
  messageId: string;
  operation: 'toggle' | 'update' | 'validate' | 'sync';
  currentState?: boolean;
  targetState?: boolean;
  conversationId?: string;
  agentId?: string;
}
