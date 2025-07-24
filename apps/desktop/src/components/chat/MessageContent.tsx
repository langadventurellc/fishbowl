import { MessageContentProps } from "@fishbowl-ai/shared";
import { useState } from "react";

/**
 * MessageContent component displays message text with proper formatting and typography.
 *
 * Extracted from DesignPrototype.tsx to create a display component that renders
 * message text content with proper line spacing, whitespace preservation, text
 * selection support, and automatic expansion functionality for long messages.
 *
 * Features:
 * - Typography extracted from DesignPrototype (14px font, 1.5 line-height)
 * - Vertical padding (8px) matching DesignPrototype messageContent styling
 * - Whitespace preservation with `whiteSpace: "pre-wrap"`
 * - Text selection and copying functionality enabled
 * - Theme-aware styling with CSS custom properties
 * - Support for different message types (user, agent, system)
 * - **Automatic content expansion**: Messages longer than threshold (default 250 chars) show "Show more..." button
 * - **Self-contained logic**: No external state or callbacks required
 * - **Keyboard accessible**: Show more/less button supports Enter and Space keys
 * - Proper overflow handling for long content
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

  // Component styles extracted from DesignPrototype.tsx (lines 374-379)
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
