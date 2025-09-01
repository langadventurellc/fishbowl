import type {
  Conversation as _Conversation,
  Message as _Message,
  ConversationAgent as _ConversationAgent,
  CreateMessageInput as _CreateMessageInput,
} from "@fishbowl-ai/shared";

/**
 * Platform-agnostic service interface for conversation operations
 *
 * Provides clean abstraction over platform-specific IPC calls, enabling
 * the conversation domain store to work independently of window.electronAPI.
 *
 * Method signatures exactly match current IPC surface for seamless integration.
 * All methods throw errors (no ErrorState at interface level).
 *
 * This interface follows the Platform Abstraction Pattern:
 * - Interface defined in shared package
 * - Platform-specific implementations in app directories
 * - Business logic remains platform-independent
 * - Dependency injection enables clean testing and platform switching
 */
export interface ConversationService {
  // Interface methods will be added in subsequent tasks
}
