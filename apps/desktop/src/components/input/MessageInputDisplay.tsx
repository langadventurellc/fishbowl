import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { MessageInputDisplayProps } from "@fishbowl-ai/shared";

/**
 * MessageInputDisplay component variants using class-variance-authority.
 * Defines size-specific styling that matches the original CSS-in-JS implementation.
 */
const messageInputVariants = cva("", {
  variants: {
    size: {
      small: "min-h-8 max-h-[120px] px-3 py-2 text-description",
      medium: "min-h-10 max-h-[180px] px-3 py-3 text-sm",
      large: "min-h-12 max-h-[240px] px-4 py-4 text-base",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

/**
 * MessageInputDisplay component renders a text input area for composing conversation messages.
 * Now enhanced with shadcn/ui Textarea primitives while preserving all original functionality.
 * Features auto-resizing capabilities, multiple size variants, and disabled state support.
 * Integrates with the application's theming system for consistent visual styling.
 */
export function MessageInputDisplay({
  placeholder = "Type your message here...",
  content = "",
  disabled = false,
  size = "medium",
  className = "",
}: MessageInputDisplayProps) {
  return (
    <Textarea
      defaultValue={content}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(messageInputVariants({ size }), className)}
    />
  );
}
