import { ChatContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import React, { useRef, useCallback, useEffect, useLayoutEffect } from "react";
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
  autoScroll = true,
  maxHeight,
  messageSpacing = "12px",
  containerPadding = "16px 24px",
  emptyState,
  className,
  style,
  onScroll,
}) => {
  // Refs for pinning functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  // Track previous message count; start at 0 so first non-empty render treats as initial load
  const prevMessageCount = useRef(0);
  const shouldScrollToBottom = useRef(true);

  // Dynamic styles using CSS custom properties
  const dynamicStyles: React.CSSProperties = {
    "--container-padding": containerPadding,
    "--message-spacing": messageSpacing,
    "--max-height": maxHeight || "none",
    // Merge custom styles
    ...style,
  } as React.CSSProperties;

  // IntersectionObserver for pinned detection
  useEffect(() => {
    if (!scrollRef.current || !bottomSentinelRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const pinned = entry.isIntersecting;
          shouldScrollToBottom.current = pinned;
        }
      },
      {
        root: scrollRef.current,
        // Consider within 100px of bottom as "pinned"
        rootMargin: "0px 0px -100px 0px",
      },
    );

    io.observe(bottomSentinelRef.current);
    return () => io.disconnect();
  }, []);

  // Scroll handler - detect when user manually scrolls away from bottom
  const handleScroll = useCallback(() => {
    // IntersectionObserver controls the pinned state; we just forward the event
    onScroll?.();
  }, [onScroll]);

  // Fix initial load flicker with useLayoutEffect
  useLayoutEffect(() => {
    if (!autoScroll) return;

    const el = scrollRef.current;
    const count = messages?.length || 0;

    if (!el) return;

    const initialLoad = count > 0 && prevMessageCount.current === 0;
    if (initialLoad) {
      el.scrollTop = el.scrollHeight;
      shouldScrollToBottom.current = true;
    }
  }, [autoScroll, messages?.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (!autoScroll) return;

    const currentCount = messages?.length || 0;
    const element = scrollRef.current;

    if (!element) return;

    const hasNewMessages = currentCount > prevMessageCount.current;
    const isInitialLoad = currentCount > 0 && prevMessageCount.current === 0;

    // Scroll to bottom only if:
    // - Initial non-empty load, or
    // - New messages arrived and the user is pinned to bottom
    if (isInitialLoad || (hasNewMessages && shouldScrollToBottom.current)) {
      requestAnimationFrame(() => {
        if (element) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: isInitialLoad ? "auto" : "smooth",
          });
        }
      });
    }

    prevMessageCount.current = currentCount;
  }, [autoScroll, messages]);

  // ResizeObserver to stay pinned during dynamic content growth
  useEffect(() => {
    if (!contentRef.current || !scrollRef.current) return;

    let lastScrollHeight = scrollRef.current.scrollHeight;
    const ro = new ResizeObserver(() => {
      const el = scrollRef.current;
      if (!el || !autoScroll) return;

      const nextScrollHeight = el.scrollHeight;
      const grew = nextScrollHeight > lastScrollHeight;
      lastScrollHeight = nextScrollHeight;

      // Be more aggressive - if content grew, scroll to bottom
      if (grew && shouldScrollToBottom.current) {
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        });
      }
    });

    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [autoScroll]);

  // Reset scroll behavior when conversation changes (messages become empty)
  const isEmpty = !messages || messages.length === 0;
  useEffect(() => {
    if (isEmpty) {
      shouldScrollToBottom.current = true;
      prevMessageCount.current = 0;
    }
  }, [isEmpty]);

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
          "flex flex-1 overflow-y-auto",
          maxHeight && "max-h-[var(--max-height)]",
          // Hide scrollbar while keeping functionality
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        )}
        style={dynamicStyles}
        onScroll={handleScroll}
      >
        <div
          ref={contentRef}
          className="flex flex-col p-[var(--container-padding)] gap-[var(--message-spacing)]"
        >
          {renderContent()}
          <div
            ref={bottomSentinelRef}
            style={{ height: 1 }}
            data-testid="bottom-sentinel"
          />
        </div>
      </div>
    </div>
  );
};
