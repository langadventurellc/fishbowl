// Type definitions
export type { Conversation } from "./Conversation";
export type { CreateConversationInput } from "./CreateConversationInput";
export type { UpdateConversationInput } from "./UpdateConversationInput";
export type { ConversationResult } from "./ConversationResult";

// Schemas
export {
  conversationSchema,
  createConversationInputSchema,
  updateConversationInputSchema,
} from "./schemas";

// Inferred types from schemas
export type {
  ConversationSchema,
  CreateConversationInputSchema,
  UpdateConversationInputSchema,
} from "./schemas";

// Error classes
export {
  ConversationNotFoundError,
  ConversationValidationError,
} from "./errors";
