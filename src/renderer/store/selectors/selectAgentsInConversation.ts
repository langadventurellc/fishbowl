import type { AppState } from '../types';

/**
 * Creates a selector to find agents participating in a specific conversation.
 * @param conversationId - The conversation ID
 * @returns A selector function that returns agents in the conversation
 */
export const selectAgentsInConversation = (conversationId: string) => (state: AppState) => {
  return state.agents.filter(agent => {
    const status = state.agentStatuses[agent.id];
    return status?.currentConversations.includes(conversationId) ?? false;
  });
};
