import { cn } from "@/lib/utils";
import {
  MessageInputContainerProps,
  MessageInputDisplayProps,
  SendButtonDisplayProps,
  useChatStore,
  useConversationStore,
} from "@fishbowl-ai/ui-shared";
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { SendButtonDisplay } from "./SendButtonDisplay";

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
  conversationId: _conversationId,
  layoutVariant = "default",
  className = "",
  messageInputProps = {},
  sendButtonProps = {},
  scrollMethods,
}: MessageInputContainerProps) {
  // Local form state
  const [content, setContent] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Ref for textarea to handle focus and selection
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Configurable height constants - easily adjustable
  const MIN_HEIGHT = layoutVariant === "compact" ? 32 : 40; // min-h-8 or min-h-10 in pixels
  const MAX_HEIGHT = layoutVariant === "compact" ? 120 : 180; // max-h-[120px] or max-h-[180px]

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to minimum to get accurate scrollHeight
    textarea.style.height = `${MIN_HEIGHT}px`;

    // Calculate new height based on content
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT,
    );

    // Apply the new height
    textarea.style.height = `${newHeight}px`;
  }, [content, MIN_HEIGHT, MAX_HEIGHT]);

  // Conversation store for unified state management
  const {
    activeMessages,
    activeConversationAgents,
    loading,
    error,
    sendUserMessage,
  } = useConversationStore();
  const { sendingMessage } = useChatStore();

  // Clear local error when user starts typing
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      if (localError) {
        setLocalError(null);
      }
    },
    [localError],
  );

  // Handle message submission
  const handleSendMessage = useCallback(async () => {
    // Check if this is the first message in the conversation
    const isFirstMessage = activeMessages.length === 0;

    // Require message content only for the first message
    if (isFirstMessage && !content.trim()) {
      setLocalError("Message content cannot be empty");
      return;
    }

    // Check if there's at least one enabled agent
    const enabledAgents = activeConversationAgents.filter(
      (agent) => agent.enabled,
    );

    if (enabledAgents.length === 0) {
      setLocalError("At least one agent must be enabled");
      return;
    }

    try {
      // Snapshot pinned state before sending to ensure deterministic scroll
      const wasPinnedBeforeSend = scrollMethods?.wasPinned();

      // Use store's sendUserMessage action for unified orchestration
      await sendUserMessage(content.trim() || undefined);

      // Deterministic scroll based on pre-send pinned state
      if (wasPinnedBeforeSend) {
        scrollMethods?.scrollToBottom();
      }

      // Clear input on successful send
      setContent("");
      setLocalError(null);

      // Focus back to textarea for continued interaction
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } catch {
      // Error is handled by store error state
      // Keep the input content so user can retry
    }
  }, [
    content,
    activeMessages.length,
    activeConversationAgents,
    sendUserMessage,
    scrollMethods,
  ]);

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
          if (!sendingMessage && !loading.sending) {
            handleSendMessage();
          }
        }
      }
    },
    [sendingMessage, loading.sending, handleSendMessage],
  );

  // Determine if send button should be disabled
  // Only disable when actually sending, not when content is empty (to allow validation)
  const isSendDisabled = sendingMessage || loading.sending;

  // Determine if input should be disabled
  const isInputDisabled = false; // Allow typing even during sending

  // Get current error to display
  const displayError = localError || error.sending?.message || null;

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
    loading: sendingMessage || loading.sending,
    "aria-label": "Send message",
    ...sendButtonProps,
  };

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "min-h-[72px] flex items-end bg-card border-t border-border box-border p-4 gap-3",
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
              // Size-specific styling (height controlled by JavaScript)
              layoutVariant === "compact" ? "text-description" : "text-sm",
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
