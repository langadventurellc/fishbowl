import { SendButtonDisplayProps } from "@fishbowl-ai/shared";
import { Button } from "./Button";

/**
 * SendButtonDisplay component renders the send button for submitting conversation messages.
 * Features visual feedback for enabled, disabled, and loading states with appropriate
 * styling changes to indicate the current interaction state.
 *
 * Uses the unified Button component with primary variant and medium size (40px x 40px)
 * for consistent appearance with the rest of the interface.
 */
export function SendButtonDisplay({
  disabled = false,
  loading = false,
  className = "",
  "aria-label": ariaLabel = "Send message",
}: SendButtonDisplayProps) {
  return (
    <Button
      variant={loading ? "secondary" : "primary"}
      size="medium"
      disabled={disabled}
      loading={loading}
      className={className}
      aria-label={ariaLabel}
    >
      ➤
    </Button>
  );
}
