import { cn } from "@/lib/utils";
import { ContextStatisticsProps } from "@fishbowl-ai/ui-shared";
import { AlertTriangle, MessageCircle } from "lucide-react";

/**
 * ContextStatistics component displays context inclusion statistics and warnings.
 *
 * A visual feedback component that shows users how message inclusion affects
 * conversation context. Displays count statistics for included messages and
 * provides warning states when no messages are included in context.
 *
 * Features:
 * - Message inclusion count display with clear messaging
 * - Warning states for empty context with optional warning icons
 * - Multiple display variants (default, compact, minimal) for different layouts
 * - Accessible text descriptions and ARIA labeling
 * - Responsive design that adapts to container size
 * - Theme-aware styling with consistent color usage
 *
 * Display States:
 * - Normal: Shows "X messages included in context" with message icon
 * - Warning: Shows "No messages included in context" with optional warning icon
 * - Empty: Shows "No messages in conversation" for empty conversations
 *
 * @example
 * ```tsx
 * // Normal context display
 * <ContextStatistics
 *   messages={messagesWithMixedInclusion}
 * />
 *
 * // Warning state with icon
 * <ContextStatistics
 *   messages={messagesAllExcluded}
 *   showWarningIcon={true}
 * />
 *
 * // Compact variant
 * <ContextStatistics
 *   messages={messages}
 *   variant="compact"
 *   className="custom-stats"
 * />
 * ```
 */
export function ContextStatistics(props: ContextStatisticsProps) {
  const {
    messages,
    variant = "default",
    showWarningIcon = false,
    className,
  } = props;

  // Calculate included message count
  const includedCount = messages.filter((message) => message.isActive).length;
  const totalCount = messages.length;

  // Determine display state
  const hasMessages = totalCount > 0;
  const hasIncludedMessages = includedCount > 0;
  const showWarning = hasMessages && !hasIncludedMessages;

  // Generate display text based on state
  const getDisplayText = () => {
    if (!hasMessages) {
      return "No messages in conversation";
    }

    if (!hasIncludedMessages) {
      return "No messages included in context";
    }

    const messageText = includedCount === 1 ? "message" : "messages";
    return `${includedCount} ${messageText} included in context`;
  };

  // Generate icon based on state and props
  const getIcon = () => {
    if (!hasMessages || variant === "minimal") {
      return null;
    }

    if (showWarning && showWarningIcon) {
      return (
        <AlertTriangle className="h-4 w-4 text-orange-500" aria-hidden="true" />
      );
    }

    if (hasIncludedMessages && variant !== "compact") {
      return (
        <MessageCircle
          className="h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      );
    }

    return null;
  };

  // Generate CSS classes based on variant and state
  const containerClasses = cn(
    "flex items-center gap-2 text-sm",
    {
      // Variant-specific styling
      "px-3 py-2": variant === "default",
      "px-2 py-1": variant === "compact",
      "p-0": variant === "minimal",

      // State-specific styling
      "text-orange-600": showWarning,
      "text-muted-foreground": !showWarning && hasIncludedMessages,
      "text-gray-500": !hasMessages,
    },
    className,
  );

  const textClasses = cn("leading-tight", {
    "text-xs": variant === "compact",
    "font-medium": showWarning,
  });

  const icon = getIcon();
  const displayText = getDisplayText();

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label={`Context statistics: ${displayText}`}
    >
      {icon}
      <span className={textClasses}>{displayText}</span>
    </div>
  );
}
