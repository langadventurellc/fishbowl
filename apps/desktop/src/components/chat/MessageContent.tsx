import { MessageContentProps } from "@fishbowl-ai/shared";
import { useState } from "react";

/**
 * MessageContent component displays message text with proper formatting and typography.
 *
 * A specialized display component that renders message text content with optimal
 * readability, whitespace preservation, and intelligent expansion handling for
 * long messages. Provides a consistent text display experience across all message types.
 *
 * Features:
 * - Optimized typography with 14px font size and 1.5 line-height for readability
 * - Consistent vertical padding (8px) for proper visual spacing
 * - Whitespace preservation using `whiteSpace: "pre-wrap"` for formatted text
 * - Full text selection and copying functionality for user convenience
 * - Theme-aware styling with CSS custom properties for dark/light mode support
 * - Contextual styling for different message types (user, agent, system)
 * - **Smart content expansion**: Messages exceeding character threshold show expandable interface
 * - **Self-contained state management**: No external dependencies for expansion logic
 * - **Full keyboard accessibility**: Expansion controls support Enter and Space key activation
 * - Intelligent overflow handling with word-boundary-aware truncation
 *
 * @example
 * ```tsx
 * // Basic agent message content
 * <MessageContent
 *   content="This is a helpful response to your question."
 *   messageType="agent"
 * />
 *
 * // Multi-line content with line breaks
 * <MessageContent
 *   content="This is a longer message with\nmultiple lines\n\nAnd paragraph breaks."
 *   messageType="agent"
 * />
 *
 * // System message content
 * <MessageContent
 *   content="User joined the conversation"
 *   messageType="system"
 * />
 *
 * // Message with custom expansion threshold
 * <MessageContent
 *   content="A shorter message that expands at 200 characters..."
 *   messageType="agent"
 *   expansionThreshold={200}
 * />
 * ```
 */
export function MessageContent({
  content,
  messageType,
  className,
  expansionThreshold = 250,
}: MessageContentProps) {
  // Expansion state for long messages
  const [isExpanded, setIsExpanded] = useState(false);

  // Utility functions - updated to use character count instead of line count
  const isLongMessage = (content: string) => {
    return content.length > expansionThreshold;
  };

  const getMessagePreview = (content: string) => {
    if (content.length <= expansionThreshold) {
      return content;
    }
    // Find a good break point near the threshold (prefer word boundaries)
    const truncated = content.substring(0, expansionThreshold);
    const lastSpaceIndex = truncated.lastIndexOf(" ");
    const breakPoint =
      lastSpaceIndex > expansionThreshold * 0.8
        ? lastSpaceIndex
        : expansionThreshold;
    return content.substring(0, breakPoint).trim() + "...";
  };

  const isLong = isLongMessage(content);
  const displayContent =
    isLong && !isExpanded ? getMessagePreview(content) : content;

  // Component styles for consistent text formatting and readability
  const styles = {
    content: {
      fontSize: "14px",
      lineHeight: "1.5",
      padding: "8px 0",
      whiteSpace: "pre-wrap" as const,
      color:
        messageType === "system"
          ? "var(--muted-foreground)"
          : "var(--foreground)",
      fontStyle: messageType === "system" ? "italic" : "normal",
      textAlign:
        messageType === "system" ? ("center" as const) : ("left" as const),
      userSelect: "text" as const,
      WebkitUserSelect: "text" as const,
      MozUserSelect: "text" as const,
      msUserSelect: "text" as const,
    } as const,
    showMoreLink: {
      color: "var(--primary)",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      marginTop: "4px",
      transition: "opacity 0.15s",
      opacity: "0.7",
    } as const,
  };

  return (
    <div
      style={styles.content}
      className={className}
      role="article"
      aria-label={`${messageType} message content`}
    >
      {displayContent}
      {isLong && (
        <div
          style={styles.showMoreLink}
          onClick={() => setIsExpanded(!isExpanded)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "0.7";
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {isExpanded ? "Show less" : "Show more..."}
        </div>
      )}
    </div>
  );
}
