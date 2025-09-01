/**
 * Main state interface for the conversation store.
 *
 * Manages active conversation focus with centralized coordination of conversations,
 * messages, and agents. Includes loading states, error handling, and race condition
 * protection through request tokens.
 */

import type {
  Conversation,
  Message,
  ConversationAgent,
} from "@fishbowl-ai/shared";
import type { ErrorState } from "../ErrorState";

export interface ConversationStoreState {
  /** Currently selected conversation ID, null when no conversation is active */
  activeConversationId: string | null;

  /** Complete list of all user conversations, ordered by most recent activity */
  conversations: Conversation[];

  /** Messages for the currently active conversation only (not multi-conversation cache) */
  activeMessages: Message[];

  /** Conversation agents for the currently active conversation */
  activeConversationAgents: ConversationAgent[];

  /**
   * Active request token for race condition handling.
   * Used to filter stale responses when activeConversationId changes during async operations.
   */
  activeRequestToken: string | null;

  /** Loading states for all major store operations */
  loading: {
    /** Loading conversation list from service */
    conversations: boolean;
    /** Loading messages for active conversation */
    messages: boolean;
    /** Loading agents for active conversation */
    agents: boolean;
    /** Sending user message and triggering orchestration */
    sending: boolean;
  };

  /**
   * Error states using existing ErrorState pattern.
   * Store converts service layer errors to ErrorState for consistent UI error handling.
   */
  error: {
    /** Error during conversation list operations */
    conversations?: ErrorState;
    /** Error during message operations */
    messages?: ErrorState;
    /** Error during agent operations */
    agents?: ErrorState;
    /** Error during message sending or orchestration */
    sending?: ErrorState;
  };

  /**
   * Configurable maximum number of messages to keep in activeMessages.
   * Enables client-side message trimming for memory management.
   */
  maximumMessages: number;
}
