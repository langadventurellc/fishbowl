import { cn } from "@/lib/utils";
import { InputContainerDisplayProps } from "@fishbowl-ai/ui-shared";
import { cva } from "class-variance-authority";
import { ConversationModeToggleDisplay } from "./ConversationModeToggleDisplay";
import { MessageInputDisplay } from "./MessageInputDisplay";
import { SendButtonDisplay } from "./SendButtonDisplay";

/**
 * InputContainerDisplay component variants using class-variance-authority.
 * Defines layout-specific spacing that matches the original CSS-in-JS implementation.
 */
const inputContainerVariants = cva(
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
 * InputContainerDisplay component renders the complete message input area for the conversation interface.
 * Now enhanced with Tailwind utilities while preserving all original functionality and layout variants.
 * Composes MessageInputDisplay, SendButtonDisplay, and ConversationModeToggleDisplay components
 * within a flexible container that provides proper layout, spacing, and theming.
 *
 * Layout Variants:
 * - Default: Standard spacing (16px padding, 12px gap) for normal use
 * - Compact: Reduced spacing (12px padding, 8px gap) for smaller screens
 */
export function InputContainerDisplay({
  layoutVariant = "default",
  className = "",
  messageInputProps = {},
  sendButtonProps = {},
  modeToggleProps = {},
}: InputContainerDisplayProps) {
  // Default props for child components based on layout variant
  const defaultMessageInputProps = {
    placeholder: "Type your message here...",
    size:
      layoutVariant === "compact" ? ("small" as const) : ("medium" as const),
    ...messageInputProps,
  };

  const defaultSendButtonProps = {
    disabled: false,
    loading: false,
    "aria-label": "Send message",
    ...sendButtonProps,
  };

  const defaultModeToggleProps = {
    currentMode: "manual" as const,
    disabled: false,
    ...modeToggleProps,
  };

  return (
    <div className={cn(inputContainerVariants({ layoutVariant }), className)}>
      <MessageInputDisplay {...defaultMessageInputProps} />
      <SendButtonDisplay {...defaultSendButtonProps} />
      <ConversationModeToggleDisplay {...defaultModeToggleProps} />
    </div>
  );
}
