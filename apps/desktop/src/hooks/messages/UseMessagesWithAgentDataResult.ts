/**
 * Result interface for useMessagesWithAgentData hook.
 *
 * @module hooks/messages/UseMessagesWithAgentDataResult
 */

import type { MessageViewModel } from "@fishbowl-ai/ui-shared";

export interface UseMessagesWithAgentDataResult {
  /** Fully resolved messages with agent names and roles */
  messages: MessageViewModel[];
  /** Combined loading state from all data sources */
  isLoading: boolean;
  /** Error from any of the data sources */
  error: Error | null;
  /** Refetch function to reload all data */
  refetch: () => Promise<void>;
  /** Whether the messages list is empty */
  isEmpty: boolean;
}
