import { MessageItemProps } from "@fishbowl-ai/shared";
import { useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageHeader } from "./MessageHeader";

/**
 * MessageItem component displays individual messages with proper layout and styling.
 *
 * Extracted from DesignPrototype.tsx to create a display component that composes
 * MessageHeader and MessageContent into a complete message container. Maintains the
 * card-like visual styling and includes context toggle functionality.
 *
 * Features:
 * - Interactive context toggle button for user and agent messages
 * - Composes MessageHeader and MessageContent components
 * - Supports all message types (user, agent, system)
 * - Card-like layout with theme-aware styling
 * - Agent color coding system
 * - Proper visual hierarchy and spacing
 * - Theme switching support (light/dark)
 * - Accessibility features with ARIA labels and keyboard navigation
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
  const {
    message,
    className,
    canRegenerate,
    onToggleContext,
    onContextMenuAction,
  } = props;
  const [isActive, setIsActive] = useState(message.isActive);

  const handleToggleContext = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    onToggleContext(message.id);
  };

  // Context menu handlers
  const handleCopy = () => {
    onContextMenuAction("copy", message.id);
  };

  const handleDelete = () => {
    onContextMenuAction("delete", message.id);
  };

  const handleRegenerate = () => {
    onContextMenuAction("regenerate", message.id);
  };

  // Position logic from DesignPrototype - show menu above for last messages
  const shouldShowMenuAbove = () => {
    // For now, default to below - could be enhanced with viewport detection
    return false;
  };
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
    contextToggle: {
      position: "absolute" as const,
      right: "8px",
      top: "8px",
      width: "20px",
      height: "20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.15s",
      zIndex: 100,
    } as const,
    contextToggleActive: {
      backgroundColor: "var(--primary)",
      color: "var(--primary-foreground)",
    } as const,
    contextToggleInactive: {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
    } as const,
  };

  // Apply inactive styling if message is not active
  const messageWrapperStyle = {
    ...styles.messageWrapper,
    ...(isActive ? {} : styles.messageInactive),
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
          <button
            style={{
              ...styles.contextToggle,
              ...(isActive
                ? styles.contextToggleActive
                : styles.contextToggleInactive),
            }}
            onClick={handleToggleContext}
            title={
              isActive
                ? "Click to exclude from context"
                : "Click to include in context"
            }
            aria-label={
              isActive
                ? "Exclude message from conversation context"
                : "Include message in conversation context"
            }
          >
            {isActive ? "✓" : ""}
          </button>
          <div style={styles.userMessageWrapper}>
            <div style={styles.userMessage}>
              <div style={{ position: "relative" }}>
                <MessageHeader
                  agentName={message.agent}
                  agentRole={message.role}
                  agentColor={message.agentColor}
                  timestamp={message.timestamp}
                  messageType={message.type}
                />
                <div style={{ position: "absolute", right: "0", top: "0" }}>
                  <MessageContextMenu
                    message={message}
                    position={shouldShowMenuAbove() ? "above" : "below"}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                    onRegenerate={handleRegenerate}
                    canRegenerate={canRegenerate}
                  />
                </div>
              </div>
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
          <button
            style={{
              ...styles.contextToggle,
              ...(isActive
                ? styles.contextToggleActive
                : styles.contextToggleInactive),
            }}
            onClick={handleToggleContext}
            title={
              isActive
                ? "Click to exclude from context"
                : "Click to include in context"
            }
            aria-label={
              isActive
                ? "Exclude message from conversation context"
                : "Include message in conversation context"
            }
          >
            {isActive ? "✓" : ""}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageHeader
              agentName={message.agent}
              agentRole={message.role}
              agentColor={message.agentColor}
              timestamp={message.timestamp}
              messageType={message.type}
            />
            <MessageContextMenu
              message={message}
              position={shouldShowMenuAbove() ? "above" : "below"}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onRegenerate={handleRegenerate}
              canRegenerate={canRegenerate}
            />
          </div>
          <MessageContent
            content={message.content}
            messageType={message.type}
          />
        </div>
      )}
    </div>
  );
}
