import React from "react";
import { MessageItemProps } from "@fishbowl-ai/shared";
import { MessageHeader } from "./MessageHeader";
import { MessageContent } from "./MessageContent";

/**
 * MessageItem component displays individual messages with proper layout and styling.
 *
 * Extracted from DesignPrototype.tsx to create a pure display component that composes
 * MessageHeader and MessageContent into a complete message container. Maintains the
 * card-like visual styling while removing all interactive functionality.
 *
 * Features:
 * - Pure display component with no interactive functionality
 * - Composes MessageHeader and MessageContent components
 * - Supports all message types (user, agent, system)
 * - Card-like layout with theme-aware styling
 * - Agent color coding system
 * - Proper visual hierarchy and spacing
 * - Theme switching support (light/dark)
 *
 * Message Type Styling:
 * - System: Centered, italic, muted styling
 * - User: Right-aligned with accent background
 * - Agent: Left-aligned with header composition
 *
 * @example
 * ```tsx
 * // Agent message
 * <MessageItem
 *   message={{
 *     id: "msg-1",
 *     agent: "Technical Advisor",
 *     role: "Technical Advisor",
 *     content: "This is a helpful response...",
 *     timestamp: "2:15 PM",
 *     type: "agent",
 *     isActive: true,
 *     agentColor: "#3b82f6"
 *   }}
 *   isExpanded={false}
 *   canRegenerate={true}
 *   contextMenuOpen={false}
 *   onToggleContext={() => {}}
 *   onToggleExpansion={() => {}}
 *   onContextMenuAction={() => {}}
 *   onOpenContextMenu={() => {}}
 * />
 *
 * // User message
 * <MessageItem
 *   message={{
 *     id: "msg-2",
 *     agent: "User",
 *     role: "User",
 *     content: "What is the capital of France?",
 *     timestamp: "2:10 PM",
 *     type: "user",
 *     isActive: true,
 *     agentColor: "#6b7280"
 *   }}
 *   // ... other props
 * />
 *
 * // System message
 * <MessageItem
 *   message={{
 *     id: "msg-3",
 *     agent: "System",
 *     role: "System",
 *     content: "User joined the conversation",
 *     timestamp: "2:05 PM",
 *     type: "system",
 *     isActive: true,
 *     agentColor: "#6b7280"
 *   }}
 *   // ... other props
 * />
 * ```
 */
export function MessageItem(props: MessageItemProps) {
  const { message, className } = props;
  // Note: Interactive props (isExpanded, canRegenerate, contextMenuOpen, event handlers)
  // are received but not used since this is a pure display component
  // Component styles extracted from DesignPrototype.tsx
  const styles = {
    message: {
      width: "100%",
    } as const,
    messageWrapper: {
      position: "relative" as const,
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid transparent",
      backgroundColor: "transparent",
    } as const,
    messageInactive: {
      opacity: 0.5,
    } as const,
    systemMessage: {
      fontStyle: "italic",
      color: "var(--muted-foreground)",
      textAlign: "center" as const,
      fontSize: "12px",
      padding: "8px 0",
    } as const,
    userMessage: {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
      padding: "12px 16px",
      borderRadius: "12px",
      marginLeft: "auto",
      maxWidth: "70%",
    } as const,
    userMessageWrapper: {
      display: "flex",
      justifyContent: "flex-end",
      width: "100%",
    } as const,
  };

  // Apply inactive styling if message is not active
  const messageWrapperStyle = {
    ...styles.messageWrapper,
    ...(message.isActive ? {} : styles.messageInactive),
  };

  return (
    <div
      style={styles.message}
      className={className}
      role="article"
      aria-label={`${message.type} message from ${message.agent}`}
    >
      {message.type === "system" ? (
        // System messages: Simple centered display
        <div style={styles.systemMessage}>{message.content}</div>
      ) : message.type === "user" ? (
        // User messages: Right-aligned with accent styling
        <div style={messageWrapperStyle}>
          <div style={styles.userMessageWrapper}>
            <div style={styles.userMessage}>
              <MessageHeader
                agentName={message.agent}
                agentRole={message.role}
                agentColor={message.agentColor}
                timestamp={message.timestamp}
                messageType={message.type}
              />
              <MessageContent
                content={message.content}
                messageType={message.type}
              />
            </div>
          </div>
        </div>
      ) : (
        // Agent messages: Left-aligned with standard layout
        <div style={messageWrapperStyle}>
          <MessageHeader
            agentName={message.agent}
            agentRole={message.role}
            agentColor={message.agentColor}
            timestamp={message.timestamp}
            messageType={message.type}
          />
          <MessageContent
            content={message.content}
            messageType={message.type}
          />
        </div>
      )}
    </div>
  );
}
