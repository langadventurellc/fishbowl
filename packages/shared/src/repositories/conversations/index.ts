export type { ConversationsRepositoryInterface } from "./ConversationsRepositoryInterface";
export { ConversationsRepository } from "./ConversationsRepository";

// Re-export conversation types for convenience
export type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ConversationResult,
} from "../../types/conversations";

export {
  ConversationNotFoundError,
  ConversationValidationError,
} from "../../types/conversations";
