/**
 * Return type for useConversationAgents hook.
 *
 * @module hooks/types/UseConversationAgentsResult
 */

import type { ConversationAgentViewModel } from "@fishbowl-ai/ui-shared";

export interface UseConversationAgentsResult {
  /** Array of conversation agent view models with populated agent data */
  conversationAgents: ConversationAgentViewModel[];
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error state for error handling */
  error: Error | null;
  /** Function to add an agent to the conversation */
  addAgent: (agentId: string) => Promise<void>;
  /** Function to remove an agent from the conversation */
  removeAgent: (agentId: string) => Promise<void>;
  /** Function to manually reload conversation agents */
  refetch: () => Promise<void>;
}
