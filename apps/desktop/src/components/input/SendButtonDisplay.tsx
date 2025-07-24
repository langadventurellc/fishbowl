import { SendButtonDisplayProps } from "@fishbowl-ai/shared";
import { Button } from "./Button";

/**
 * SendButtonDisplay component renders a visual representation of the send button
 * without any interactive functionality. Pure display component for showcase purposes.
 *
 * Uses the existing Button component with primary variant and medium size to match
 * DesignPrototype.tsx lines 422-435 specifications (40px x 40px, primary styling).
 * Supports enabled, disabled, and loading visual states.
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
