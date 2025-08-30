import { cn } from "@/lib/utils";
import { useCreateMessage } from "@/hooks/messages";
import { useChatStore } from "@fishbowl-ai/ui-shared";
import {
  MessageInputDisplayProps,
  SendButtonDisplayProps,
  MessageInputContainerProps,
} from "@fishbowl-ai/ui-shared";
import { cva } from "class-variance-authority";
import React, { useCallback, useState, useRef, KeyboardEvent } from "react";
import { SendButtonDisplay } from "./SendButtonDisplay";

/**
 * MessageInputContainer component variants using class-variance-authority.
 * Defines layout-specific spacing that matches the original CSS-in-JS implementation.
 */
const messageInputContainerVariants = cva(
  // Base styles
  "min-h-[72px] flex items-end bg-card border-t border-border box-border",
  {
    variants: {
      layoutVariant: {
        default: "p-4 gap-3", // 16px padding, 12px gap
        compact: "p-3 gap-2", // 12px padding, 8px gap
      },
    },
    defaultVariants: {
      layoutVariant: "default",
    },
  },
);

/**
 * MessageInputContainer component integrates the MessageInputDisplay and SendButtonDisplay
 * components with state management for complete message sending functionality.
 *
 * This component connects to useCreateMessage hook and useChatStore to provide:
 * - Form state management with validation
 * - Loading states during message processing
 * - Error display and clearing
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Proper input clearing and focus management
 */
export function MessageInputContainer({
  conversationId,
  layoutVariant = "default",
  className = "",
  messageInputProps = {},
  sendButtonProps = {},
}: MessageInputContainerProps) {
  // Local form state
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Ref for textarea to handle focus and selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hooks for message creation and global chat state
  const {
    createMessage,
    sending,
    error: createError,
    reset,
  } = useCreateMessage();
  const { sendingMessage } = useChatStore();

  // Clear local error when user starts typing
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      if (localError) {
        setLocalError(null);
      }
      if (createError) {
        reset();
      }
    },
    [localError, createError, reset],
  );

  // Handle message submission
  const handleSendMessage = useCallback(async () => {
    if (!content.trim()) {
      setLocalError("Message content cannot be empty");
      return;
    }

    try {
      await createMessage({
        conversation_id: conversationId,
        role: "user",
        content: content.trim(),
        included: true,
      });

      // Clear input on successful creation
      setContent("");
      setLocalError(null);

      // Focus back to textarea for continued interaction
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch {
      // Error is handled by useCreateMessage hook
      // Keep the input content so user can retry
    }
  }, [content, conversationId, createMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter") {
        if (event.shiftKey) {
          // Shift+Enter: Allow new line (default behavior)
          return;
        } else {
          // Enter: Send message
          event.preventDefault();
          if (!sendingMessage && !sending) {
            handleSendMessage();
          }
        }
      }
    },
    [sendingMessage, sending, handleSendMessage],
  );

  // Determine if send button should be disabled
  // Only disable when actually sending, not when content is empty (to allow validation)
  const isSendDisabled = sendingMessage || sending;

  // Determine if input should be disabled
  const isInputDisabled = false; // Allow typing even during sending

  // Get current error to display
  const displayError = localError || createError?.message || null;

  // Default props for child components based on layout variant
  const defaultMessageInputProps: MessageInputDisplayProps = {
    placeholder: "Type your message here...",
    size: layoutVariant === "compact" ? "small" : "medium",
    content,
    disabled: isInputDisabled,
    ...messageInputProps,
  };

  const defaultSendButtonProps: SendButtonDisplayProps = {
    disabled: isSendDisabled,
    loading: sendingMessage || sending,
    "aria-label": "Send message",
    ...sendButtonProps,
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          messageInputContainerVariants({ layoutVariant }),
          className,
        )}
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={defaultMessageInputProps.placeholder}
            disabled={defaultMessageInputProps.disabled}
            className={cn(
              // Base textarea styling matching MessageInputDisplay
              "w-full resize-none border-0 bg-transparent p-0 focus:outline-none focus:ring-0",
              // Size-specific styling
              layoutVariant === "compact"
                ? "min-h-8 max-h-[120px] text-description"
                : "min-h-10 max-h-[180px] text-sm",
              defaultMessageInputProps.className,
            )}
            style={{
              // Prevent browser default textarea styling
              fontFamily: "inherit",
              fontSize: "inherit",
              lineHeight: "inherit",
            }}
          />
        </div>
        <div
          onClick={handleSendMessage}
          onMouseDown={(e) => e.preventDefault()} // Prevent focus stealing from textarea
        >
          <SendButtonDisplay {...defaultSendButtonProps} />
        </div>
      </div>

      {/* Error display */}
      {displayError && (
        <div className="px-4 pb-2">
          <p className="text-sm text-destructive" role="alert">
            {displayError}
          </p>
        </div>
      )}
    </div>
  );
}
