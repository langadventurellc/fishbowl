/**
 * React context for managing conversation agents state across components.
 *
 * @module contexts/ConversationAgentsContext/ConversationAgentsContext
 */

import { createContext } from "react";
import { type UseConversationAgentsResult } from "../../hooks/conversationAgents/UseConversationAgentsResult";

// Context type definition
export type ConversationAgentsContextValue = UseConversationAgentsResult;

// Create and export the context
export const ConversationAgentsContext =
  createContext<ConversationAgentsContextValue | null>(null);
