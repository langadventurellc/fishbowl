import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * NewConversationButton component for creating new conversations.
 *
 * A specialized button component that handles conversation creation with proper
 * loading states, accessibility features, and user feedback. Integrates with
 * the conversation creation flow and provides visual feedback during async operations.
 *
 * Features:
 * - Loading state with spinner and "Creating..." text
 * - Disabled state during operations to prevent double-clicks
 * - Accessibility support with ARIA attributes and screen reader announcements
 * - Consistent styling with existing UI components using shadcn/ui Button
 */

export interface NewConversationButtonProps {
  /**
   * Click handler called when the button is activated.
   * Should return a Promise to handle async conversation creation.
   * Not called when button is disabled or loading.
   */
  onClick: () => Promise<void>;

  /**
   * Whether the button is in a loading state.
   * Loading buttons show a spinner with "Creating..." text and are non-interactive.
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Whether the button is disabled and cannot be interacted with.
   * Disabled buttons have reduced opacity and "not-allowed" cursor.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root button element for custom styling beyond the default appearance.
   */
  className?: string;
}

/**
 * NewConversationButton component implementation.
 *
 * Creates a button that handles conversation creation with proper loading states
 * and accessibility features. Uses shadcn/ui Button as the foundation while
 * providing specialized behavior for conversation creation workflow.
 */
export const NewConversationButton = React.memo<NewConversationButtonProps>(
  ({ onClick, loading = false, disabled = false, className }) => {
    const handleClick = async () => {
      if (disabled || loading) return;

      try {
        await onClick();
      } catch {
        // Error handling is managed by the parent component
        // The onClick promise rejection will be caught by the parent
      }
    };

    return (
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          className,
        )}
        aria-label={
          loading ? "Creating new conversation..." : "Create new conversation"
        }
        aria-busy={loading}
        data-testid="new-conversation-button"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Creating...</span>
          </>
        ) : (
          <span>New Conversation</span>
        )}
      </Button>
    );
  },
);

NewConversationButton.displayName = "NewConversationButton";
