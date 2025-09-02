// Type definitions
export type { Message } from "./Message";
export type { CreateMessageInput } from "./CreateMessageInput";
export type { UpdateMessageInclusionInput } from "./UpdateMessageInclusionInput";
export { MessageRole, type MessageRoleType } from "./MessageRole";

// Schemas
export {
  messageSchema,
  createMessageInputSchema,
  updateMessageInclusionInputSchema,
} from "./schemas";

// Inferred types from schemas
export type {
  MessageSchema,
  CreateMessageInputSchema,
  UpdateMessageInclusionInputSchema,
} from "./schemas";

// Error classes
export { MessageNotFoundError, MessageValidationError } from "./errors";
