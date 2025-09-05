import {
  ChatContainerDisplayProps,
  MessageViewModel,
} from "@fishbowl-ai/ui-shared";
import React, { useRef, useCallback, useEffect, useLayoutEffect } from "react";
import { cn } from "../../lib/utils";
import { MessageItem } from "../chat/MessageItem";
import { ContextStatistics } from "../chat/ContextStatistics";
import { isScrolledToBottom } from "../../utils";

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
  onScrollMethods,
}) => {
  // Refs for pinning functionality
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  // Track previous message count; start at 0 so first non-empty render treats as initial load
  const prevMessageCount = useRef(0);
  // Enhanced tracking for message trimming edge cases
  const prevLastMessageId = useRef<string | null>(null);
  const shouldScrollToBottom = useRef(true);

  // Dynamic styles using CSS custom properties
  const dynamicStyles: React.CSSProperties = {
    "--container-padding": containerPadding,
    "--message-spacing": messageSpacing,
    "--max-height": maxHeight || "none",
    // Merge custom styles
    ...style,
  } as React.CSSProperties;

  // Enhanced message change detection for trimming edge cases
  const detectNewMessages = useCallback(
    (messages: MessageViewModel[] | undefined) => {
      const currentCount = messages?.length || 0;
      const currentLastId = messages?.[currentCount - 1]?.id || null;

      // Count increase = definitely new messages
      const countIncreased = currentCount > prevMessageCount.current;

      // Same count but different last message = trimming occurred
      const contentChanged =
        currentCount > 0 &&
        currentCount === prevMessageCount.current &&
        currentLastId !== prevLastMessageId.current;

      const hasNewContent = countIncreased || contentChanged;

      // Compute isInitialLoad BEFORE updating refs
      const isInitialLoad = currentCount > 0 && prevMessageCount.current === 0;

      // Update tracking refs
      prevMessageCount.current = currentCount;
      prevLastMessageId.current = currentLastId;

      return {
        hasNewContent,
        isInitialLoad,
      };
    },
    [],
  );

  // IntersectionObserver for diagnostics only - do not overwrite pinned snapshot
  useEffect(() => {
    if (!scrollRef.current || !bottomSentinelRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && scrollRef.current) {
          // Use IntersectionObserver for diagnostics only
          const _observerPinned = entry.isIntersecting;
          const _actuallyPinned = isScrolledToBottom(scrollRef.current, 100);

          // DO NOT overwrite shouldScrollToBottom.current here
          // Only user scroll should change the snapshot
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

  // Imperative scroll methods for external control
  const scrollToBottom = useCallback(
    (behavior: "auto" | "smooth" = "smooth") => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior,
        });
      }
    },
    [],
  );

  const scrollToBottomIfPinned = useCallback(
    (threshold = 100) => {
      if (
        scrollRef.current &&
        isScrolledToBottom(scrollRef.current, threshold)
      ) {
        scrollToBottom();
        return true; // scrolled
      }
      return false; // not scrolled
    },
    [scrollToBottom],
  );

  const wasPinned = useCallback(
    () => shouldScrollToBottom.current === true,
    [],
  );

  // Expose methods via callback prop
  useEffect(() => {
    onScrollMethods?.({ scrollToBottomIfPinned, scrollToBottom, wasPinned });
  }, [onScrollMethods, scrollToBottomIfPinned, scrollToBottom, wasPinned]);

  // Scroll handler - use scroll math as primary pinned detection
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      // Primary detection: use synchronous scroll math
      const pinnedToBottom = isScrolledToBottom(scrollRef.current, 100);
      shouldScrollToBottom.current = pinnedToBottom;
    }
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
      // Check if user was already pinned on mount to avoid unexpected jumps
      const wasPinnedOnMount = isScrolledToBottom(el, 100);
      if (wasPinnedOnMount) {
        el.scrollTop = el.scrollHeight;
        shouldScrollToBottom.current = true;
      } else {
        // Initialize snapshot based on current position
        shouldScrollToBottom.current = wasPinnedOnMount;
      }
    } else if (prevMessageCount.current === 0) {
      // Initialize cached pinned state from reality at mount for non-initial loads
      shouldScrollToBottom.current = isScrolledToBottom(el, 100);
    }
  }, [autoScroll, messages?.length]);

  // Enhanced auto-scroll on new messages using cached pinned snapshot
  useEffect(() => {
    if (!autoScroll) return;

    const element = scrollRef.current;
    if (!element) return;

    const { hasNewContent, isInitialLoad } = detectNewMessages(messages);

    // Use the cached snapshot exclusively for auto-scroll decisions
    const pinnedBefore = shouldScrollToBottom.current;

    // Scroll to bottom only if:
    // - Initial non-empty load, or
    // - New content arrived (including trimming) and user was pinned before the update
    if (isInitialLoad || (hasNewContent && pinnedBefore)) {
      requestAnimationFrame(() => {
        if (element) {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: isInitialLoad ? "auto" : "smooth",
          });
        }
      });
    }
  }, [autoScroll, messages, detectNewMessages]);

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

      // Use cached snapshot for growth decisions
      if (grew && shouldScrollToBottom.current) {
        requestAnimationFrame(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        });
      }
      // Do not update shouldScrollToBottom.current in this callback
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
      prevLastMessageId.current = null; // Reset message ID tracking
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
