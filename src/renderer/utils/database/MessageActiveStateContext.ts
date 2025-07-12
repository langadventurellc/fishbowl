/**
 * Context specific to message active state operations
 */
export interface MessageActiveStateContext {
  messageId: string;
  operation: 'toggle' | 'update' | 'validate' | 'sync';
  currentState?: boolean;
  targetState?: boolean;
  conversationId?: string;
  agentId?: string;
}
