/**
 * Combined conversation store interface.
 *
 * Merges state and actions interfaces following established Zustand store patterns.
 * This type is used for the main useConversationStore implementation.
 */

import type { ConversationStoreState } from "./ConversationStoreState";
import type { ConversationStoreActions } from "./ConversationStoreActions";

export type ConversationStore = ConversationStoreState &
  ConversationStoreActions;
