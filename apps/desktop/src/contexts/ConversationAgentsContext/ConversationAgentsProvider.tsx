/**
 * ConversationAgentsProvider component that provides conversation agents state
 * to its children via React Context.
 *
 * @module contexts/ConversationAgentsContext/ConversationAgentsProvider
 */

import React, { type ReactNode } from "react";
import { useConversationAgents } from "../../hooks/conversationAgents/useConversationAgents";
import { ConversationAgentsContext } from "./ConversationAgentsContext";

// Provider props interface
interface ConversationAgentsProviderProps {
  /** The conversation ID to manage agents for, or null to provide empty state */
  conversationId: string | null;
  /** Children components that will have access to the conversation agents context */
  children: ReactNode;
}

/**
 * ConversationAgentsProvider component that provides conversation agents state
 * to its children via React Context.
 *
 * When conversationId is null, provides safe defaults:
 * - conversationAgents: []
 * - isLoading: false
 * - error: null
 * - All async methods become no-ops that resolve immediately
 *
 * When conversationId is provided, passes through all values and methods
 * from the useConversationAgents hook.
 *
 * @param props - Provider configuration
 * @returns JSX provider element
 */
export function ConversationAgentsProvider({
  conversationId,
  children,
}: ConversationAgentsProviderProps) {
  // Use the existing hook to get all the conversation agents functionality
  const value = useConversationAgents(conversationId);

  return (
    <ConversationAgentsContext.Provider value={value}>
      {children}
    </ConversationAgentsContext.Provider>
  );
}
