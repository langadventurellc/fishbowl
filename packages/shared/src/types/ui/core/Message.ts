/**
 * Message interface for conversation UI system.
 *
 * Represents a single message in the conversation with properties
 * for identification, content, metadata, and visual state.
 *
 * @module types/ui/core/Message
 */

import { MessageType } from "./MessageType";

/**
 * Represents a single message in the conversation UI system.
 *
 * This interface defines the structure for messages displayed in the chat area,
 * supporting different message types (user, agent, system) with visual state
 * management and agent color coding.
 *
 * @example
 * ```typescript
 * const userMessage: Message = {
 *   id: "msg-123",
 *   agent: "User",
 *   role: "User",
 *   content: "How do we handle data consistency across services?",
 *   timestamp: "2:20 PM",
 *   type: "user",
 *   isActive: true,
 *   agentColor: "#6366f1"
 * };
 *
 * const agentMessage: Message = {
 *   id: "msg-124",
 *   agent: "Technical Advisor",
 *   role: "Technical Advisor",
 *   content: "We can implement eventual consistency with event sourcing...",
 *   timestamp: "2:22 PM",
 *   type: "agent",
 *   isActive: true,
 *   agentColor: "#3b82f6"
 * };
 * ```
 */
export interface Message {
  /**
   * Unique identifier for the message.
   * Used for React keys, context menu targeting, and state management.
   */
  id: string;

  /**
   * Name of the agent or user who sent the message.
   * Displayed in the message header alongside the role.
   *
   * @example "Technical Advisor", "User", "System"
   */
  agent: string;

  /**
   * Role or title of the message sender.
   * Usually matches the agent name but can provide more specific context.
   *
   * @example "Technical Advisor", "Project Manager", "User"
   */
  role: string;

  /**
   * The actual message content/text.
   * Supports multi-line content with newline characters for formatting.
   * Content can include technical discussions, questions, or system notifications.
   */
  content: string;

  /**
   * Human-readable timestamp for when the message was sent.
   * Displayed in the message header with a dash prefix.
   *
   * @example "2:15 PM", "Yesterday", "Dec 15"
   */
  timestamp: string;

  /**
   * The type of message, determining visual styling and behavior.
   * - "user": Messages from the human user (right-aligned, accent color)
   * - "agent": Messages from AI agents (left-aligned, standard styling)
   * - "system": System notifications (center-aligned, muted styling)
   */
  type: MessageType;

  /**
   * Whether this message is included in the conversation context.
   * Controls the visual state of the context toggle button and affects
   * which messages are sent to agents for processing.
   *
   * Inactive messages appear with reduced opacity.
   */
  isActive: boolean;

  /**
   * Hex color code for the agent's visual theming.
   * Used for agent pills, message headers, and visual association.
   * Should be a valid CSS hex color value.
   *
   * @example "#3b82f6", "#22c55e", "#a855f7", "#6b7280"
   */
  agentColor: string;
}
