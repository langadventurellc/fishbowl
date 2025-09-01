/**
 * Hook to consume the ConversationAgentsContext.
 *
 * @module contexts/ConversationAgentsContext/useConversationAgentsContext
 */

import { useContext } from "react";
import {
  ConversationAgentsContext,
  type ConversationAgentsContextValue,
} from "./ConversationAgentsContext";

/**
 * Hook to consume the ConversationAgentsContext.
 *
 * Must be used within a ConversationAgentsProvider, otherwise throws an error.
 * Provides access to conversation agents state and management functions.
 *
 * @returns The conversation agents context value with state and methods
 * @throws Error if used outside of ConversationAgentsProvider
 */
export function useConversationAgentsContext(): ConversationAgentsContextValue {
  const context = useContext(ConversationAgentsContext);

  if (!context) {
    throw new Error(
      "useConversationAgentsContext must be used within ConversationAgentsProvider",
    );
  }

  return context;
}
