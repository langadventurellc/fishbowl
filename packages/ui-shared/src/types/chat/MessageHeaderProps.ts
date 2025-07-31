/**
 * MessageHeaderProps interface for the MessageHeader component.
 *
 * Defines props for the message metadata display component that shows
 * agent name, role, and timestamp information with proper spacing and typography.
 *
 * @module types/ui/components/MessageHeaderProps
 */

import { MessageType } from "../MessageType";

/**
 * Props interface for the MessageHeader component.
 *
 * MessageHeader displays message metadata including agent information and timestamp
 * in a consistent layout with proper spacing and typography. Used as a pure display
 * component for rendering message sender information and timestamps.
 *
 * @example
 * ```typescript
 * // Basic agent message header
 * <MessageHeader
 *   agentName="Technical Advisor"
 *   agentRole="Technical Advisor"
 *   agentColor="#3b82f6"
 *   timestamp="2:15 PM"
 *   messageType="agent"
 * />
 *
 * // User message header
 * <MessageHeader
 *   agentName="User"
 *   agentRole="User"
 *   agentColor="#6b7280"
 *   timestamp="2:20 PM"
 *   messageType="user"
 * />
 *
 * // System message header (minimal display)
 * <MessageHeader
 *   agentName="System"
 *   agentRole="System"
 *   agentColor="#64748b"
 *   timestamp="2:25 PM"
 *   messageType="system"
 * />
 * ```
 */
export interface MessageHeaderProps {
  /**
   * Display name of the message sender (agent or user).
   * Used for visual identification and MessageAvatar integration.
   * Displayed in the header with agent color coding.
   *
   * @example "Technical Advisor", "User", "Project Manager", "System"
   */
  agentName: string;

  /**
   * Role or specialty of the message sender.
   * Provides additional context about the sender's expertise.
   * Usually matches agentName but can be more descriptive.
   *
   * @example "Technical Advisor", "Senior Project Manager", "User"
   */
  agentRole: string;

  /**
   * Hex color code for the agent's visual theming.
   * Used for agent name color coding and MessageAvatar component.
   * Should be a valid CSS hex color value.
   *
   * @example "#3b82f6" (blue), "#22c55e" (green), "#ef4444" (red), "#a855f7" (purple)
   */
  agentColor: string;

  /**
   * Human-readable timestamp for when the message was sent.
   * Displayed with a dash prefix for visual consistency.
   * Format should be user-friendly (PM/AM time, relative dates, etc.).
   *
   * @example "2:15 PM", "Yesterday", "Dec 15", "Just now"
   */
  timestamp: string;

  /**
   * The type of message for conditional styling and layout.
   * Affects visual presentation and component behavior:
   * - "user": User messages (standard header layout)
   * - "agent": Agent messages (standard header layout)
   * - "system": System messages (minimal header display)
   */
  messageType: MessageType;

  /**
   * Optional CSS class name for custom styling.
   * Allows additional styling to be applied to the header container
   * while preserving the base component styling.
   */
  className?: string;
}
