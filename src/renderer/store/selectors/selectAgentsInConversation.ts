import type { AppState } from '../types';
import {
  createParameterizedFilterSelector,
  registerSelectorForMonitoring,
} from '../utils/memoization';

/**
 * Creates a memoized selector to find agents participating in a specific conversation.
 * Uses parameterized memoization to cache results for different conversation IDs.
 * @param conversationId - The conversation ID
 * @returns A memoized selector function that returns agents in the conversation
 */
const selectAgentsInConversationImpl = createParameterizedFilterSelector(
  (state: AppState) => state.agents,
  (agent, state, conversationId: string) => {
    const status = state.agentStatuses[agent.id];
    return status?.currentConversations.includes(conversationId) ?? false;
  },
  {
    enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
    maxCacheSize: 20, // Cache results for up to 20 different conversations
  },
);

// Register for performance monitoring in development
void registerSelectorForMonitoring('selectAgentsInConversation', selectAgentsInConversationImpl);

export const selectAgentsInConversation = selectAgentsInConversationImpl;
