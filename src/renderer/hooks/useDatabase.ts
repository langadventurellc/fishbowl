/**
 * Combined hook for all database operations
 */

import { useMemo } from 'react';
import { useAgents } from './useAgents';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useConversationAgents } from './useConversationAgents';

// Combined hook for all database operations
export const useDatabase = () => {
  const agentsHook = useAgents();
  const conversationsHook = useConversations();
  const messagesHook = useMessages();
  const conversationAgentsHook = useConversationAgents();

  return useMemo(
    () => ({
      agents: agentsHook,
      conversations: conversationsHook,
      messages: messagesHook,
      conversationAgents: conversationAgentsHook,
    }),
    [agentsHook, conversationsHook, messagesHook, conversationAgentsHook],
  );
};
