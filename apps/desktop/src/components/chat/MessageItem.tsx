import { cn } from "@/lib/utils";
import { MessageItemProps } from "@fishbowl-ai/ui-shared";
import { useState } from "react";
import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageHeader } from "./MessageHeader";

/**
 * MessageItem component displays individual messages with proper layout and styling.
 *
 * A complete message display component that renders individual chat messages with
 * contextual styling, interactive features, and proper accessibility support.
 * Composes MessageHeader and MessageContent components into a unified message container.
 *
 * Features:
 * - Interactive context toggle button for controlling message inclusion in conversation context
 * - Composable architecture using MessageHeader and MessageContent components
 * - Support for all message types (user, agent, system) with type-specific styling
 * - Card-like layout with consistent visual hierarchy and spacing
 * - Agent color coding system for visual identification
 * - Context menu integration for message actions (copy, delete, regenerate)
 * - Theme-aware styling with CSS custom properties
 * - Full accessibility support with ARIA labels and keyboard navigation
 *
 * Message Type Styling:
 * - System: Centered, italic, muted appearance for status messages
 * - User: Right-aligned with accent background for user input
 * - Agent: Left-aligned with full header composition for AI responses
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
  const { message, className, canRegenerate, onContextMenuAction } = props;
  const [isActive, setIsActive] = useState(message.isActive);

  const handleToggleContext = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
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

  // Context menu positioning logic - show menu above for messages near bottom of viewport
  const shouldShowMenuAbove = () => {
    if (typeof window === "undefined") return false;

    // Get current scroll position and viewport height
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const scrollBottom = scrollTop + viewportHeight;

    // Estimate if we're in the bottom third of the viewport
    // This is a simple heuristic - could be enhanced with element position detection
    return scrollBottom > document.body.scrollHeight * 0.75;
  };

  // Enhanced error message detection for system messages
  const isErrorSystemMessage = (content: string): boolean => {
    return content.startsWith("Agent ");
  };

  // Extract agent name from error message
  const extractAgentName = (content: string): string | null => {
    const match = content.match(/^Agent ([^:]+):/);
    return match ? match[1] || null : null;
  };

  // Tailwind utility classes for consistent message layout and theming
  const messageClasses = "w-full";

  const messageWrapperClasses = cn(
    "relative p-2 rounded-lg border border-transparent bg-transparent",
    !isActive && "opacity-50",
  );

  // Enhanced system message styling with error detection
  const getSystemMessageClasses = (content: string): string => {
    const baseClasses =
      "text-center text-xs py-2 px-3 rounded-md mx-auto max-w-md";

    if (isErrorSystemMessage(content)) {
      // Error system messages: subtle error indication
      return cn(
        baseClasses,
        "bg-red-50 border border-red-200 text-red-700",
        "dark:bg-red-950 dark:border-red-800 dark:text-red-300",
        "flex items-center justify-center gap-2",
      );
    }

    // Regular system messages: original styling
    return cn(baseClasses, "italic text-muted-foreground");
  };

  const userMessageClasses =
    "bg-accent text-accent-foreground py-3 px-4 rounded-xl ml-auto max-w-[70%]";
  const userMessageWrapperClasses = "flex justify-end w-full";

  const contextToggleClasses = cn(
    "absolute right-2 top-2 w-5 h-5 border-0 rounded cursor-pointer text-xs",
    "flex items-center justify-center transition-all duration-150 z-[100]",
    isActive
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground",
  );

  // Render error system message with enhanced formatting
  const renderErrorSystemMessage = (content: string) => {
    const agentName = extractAgentName(content);
    const errorMessage = content.replace(/^Agent [^:]+: /, "");

    return (
      <div className={getSystemMessageClasses(content)}>
        {/* Warning icon for error indication */}
        <svg
          className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div className="text-left">
          {agentName && (
            <div className="font-medium text-red-800 dark:text-red-200">
              {agentName}
            </div>
          )}
          <div className="text-red-700 dark:text-red-300">{errorMessage}</div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(messageClasses, className)}
      role="article"
      aria-label={`${message.type} message from ${message.agent}`}
    >
      {message.type === "system" ? (
        // System messages: Enhanced display with error detection
        isErrorSystemMessage(message.content) ? (
          renderErrorSystemMessage(message.content)
        ) : (
          <div className={getSystemMessageClasses(message.content)}>
            {message.content}
          </div>
        )
      ) : message.type === "user" ? (
        // User messages: Right-aligned with accent styling
        <div className={messageWrapperClasses}>
          <button
            className={contextToggleClasses}
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
          <div className={userMessageWrapperClasses}>
            <div className={userMessageClasses}>
              <div className="relative">
                <MessageHeader
                  agentName={message.agent}
                  agentRole={message.role}
                  agentColor={message.agentColor}
                  timestamp={message.timestamp}
                  messageType={message.type}
                />
                <div className="absolute right-0 top-0">
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
        <div className={messageWrapperClasses}>
          <button
            className={contextToggleClasses}
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
          <div className="flex items-center gap-2">
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
