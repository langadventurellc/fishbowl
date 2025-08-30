import { ChatContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../../lib/utils";
import { MessageItem } from "../chat/MessageItem";
import { ContextStatistics } from "../chat/ContextStatistics";

/**
 * ChatContainerDisplay - Scrollable messages area layout component
 *
 * Main conversation display area that renders chat messages in a scrollable container.
 * Handles message rendering, empty states, and provides proper overflow management
 * with customizable padding and spacing between messages.
 */
export const ChatContainerDisplay: React.FC<ChatContainerDisplayProps> = ({
  messages,
  onContextMenuAction,
  maxHeight,
  messageSpacing = "12px",
  containerPadding = "16px 24px",
  emptyState,
  className,
  style,
  onScroll,
}) => {
  // Scroll position tracking for auto-scroll behavior
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const prevMessageCount = useRef(messages?.length || 0);

  // Dynamic styles using CSS custom properties
  const dynamicStyles: React.CSSProperties = {
    "--container-padding": containerPadding,
    "--message-spacing": messageSpacing,
    "--max-height": maxHeight || "none",
    // Merge custom styles
    ...style,
  } as React.CSSProperties;

  // Scroll detection to determine if user is near bottom
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsNearBottom(isAtBottom);

    // Call external onScroll handler if provided
    onScroll?.();
  }, [onScroll]);

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    const currentCount = messages?.length || 0;
    if (currentCount > prevMessageCount.current && isNearBottom) {
      const element = scrollRef.current;
      if (element) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevMessageCount.current = currentCount;
  }, [messages, isNearBottom]);

  // Render messages or children
  const renderContent = () => {
    if (messages && messages.length > 0) {
      return messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          canRegenerate={message.type === "agent"}
          onContextMenuAction={onContextMenuAction || (() => {})}
        />
      ));
    }

    if (emptyState) {
      return emptyState;
    }

    return null;
  };

  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)}>
      {/* Context statistics - always visible above messages */}
      {messages && messages.length > 0 && (
        <div className="px-6 py-2 border-b border-border/50">
          <ContextStatistics messages={messages} variant="compact" />
        </div>
      )}

      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        className={cn(
          "flex flex-1 flex-col overflow-y-auto",
          "p-[var(--container-padding)] gap-[var(--message-spacing)]",
          maxHeight && "max-h-[var(--max-height)]",
          // Hide scrollbar while keeping functionality
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        )}
        style={dynamicStyles}
        onScroll={handleScroll}
      >
        {renderContent()}
      </div>
    </div>
  );
};
