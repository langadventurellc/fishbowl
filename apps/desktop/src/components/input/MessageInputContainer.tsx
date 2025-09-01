import {
  useCreateMessage,
  useMessages,
  useMessagesRefresh,
} from "@/hooks/messages";
import { cn } from "@/lib/utils";
import {
  MessageInputContainerProps,
  MessageInputDisplayProps,
  SendButtonDisplayProps,
  useChatStore,
  type ConversationAgentViewModel,
} from "@fishbowl-ai/ui-shared";
import { cva } from "class-variance-authority";
import { KeyboardEvent, useCallback, useRef, useState } from "react";
import { useConversationAgentsContext } from "../../contexts";
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
  const { refetch } = useMessagesRefresh();

  // Context for conversation agents to check if any are enabled
  const { conversationAgents } = useConversationAgentsContext();

  // Hook for checking if this is the first message
  const { messages } = useMessages(conversationId);

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
  // eslint-disable-next-line statement-count/function-statement-count-warn
  const handleSendMessage = useCallback(async () => {
    // Check if this is the first message in the conversation
    const isFirstMessage = messages.length === 0;

    // Require message content only for the first message
    if (isFirstMessage && !content.trim()) {
      setLocalError("Message content cannot be empty");
      return;
    }

    // Check if there's at least one enabled agent
    const enabledAgents = conversationAgents.filter(
      (agent: ConversationAgentViewModel) => agent.enabled,
    );

    if (enabledAgents.length === 0) {
      setLocalError("At least one agent must be enabled");
      return;
    }

    try {
      let createdMessage;
      if (content.trim()) {
        // Create a regular user message
        createdMessage = await createMessage({
          conversation_id: conversationId,
          role: "user",
          content: content.trim(),
          included: true,
        });
      } else {
        // For continuation (empty content), create a placeholder message
        // This won't be displayed but provides a messageId for orchestration
        createdMessage = await createMessage({
          conversation_id: conversationId,
          role: "system",
          content: "[Continue conversation]",
          included: false, // Don't include in API calls to agents
        });
      }

      // Clear input on successful creation
      setContent("");
      setLocalError(null);

      // Refresh messages to show the new message immediately
      if (refetch) {
        await refetch();
      }

      // Focus back to textarea for continued interaction
      if (textareaRef.current) {
        textareaRef.current.focus();
      }

      // Trigger chat orchestration if agents are enabled
      if (enabledAgents.length > 0) {
        try {
          // Check if running in Electron environment
          if (
            typeof window !== "undefined" &&
            window.electronAPI?.chat?.sendToAgents &&
            typeof window.electronAPI.chat.sendToAgents === "function"
          ) {
            await window.electronAPI.chat.sendToAgents(
              conversationId,
              createdMessage.id,
            );
          }
        } catch (orchestrationError) {
          // Log orchestration error but don't affect user experience
          console.error("Chat orchestration failed:", orchestrationError);

          // Optionally, you could set a non-blocking warning here
          // but the task requirements suggest keeping this transparent
        }
      } else {
        // No agents are enabled - create a system message with helpful guidance
        try {
          await createMessage({
            conversation_id: conversationId,
            role: "system",
            content:
              "No agents are enabled for this conversation. Enable agents to start receiving responses.",
            included: true,
          });

          // Refresh messages to show the system message
          if (refetch) {
            await refetch();
          }
        } catch (systemMessageError) {
          // Log system message creation error but don't affect user experience
          // The user message was already successfully created
          console.error("System message creation failed:", systemMessageError);
        }
      }
    } catch {
      // Error is handled by useCreateMessage hook
      // Keep the input content so user can retry
    }
  }, [
    content,
    conversationId,
    createMessage,
    conversationAgents,
    refetch,
    messages.length,
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
