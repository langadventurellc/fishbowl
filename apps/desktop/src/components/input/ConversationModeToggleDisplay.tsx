import { cn } from "@/lib/utils";
import { ConversationModeToggleDisplayProps } from "@fishbowl-ai/ui-shared";
import { cva } from "class-variance-authority";

/**
 * ConversationModeToggleDisplay component variants using class-variance-authority.
 * Defines container and mode option styling that matches the original CSS-in-JS implementation.
 */
const modeToggleContainerVariants = cva(
  // Base container styles
  "h-10 flex items-center gap-2 px-3 border border-border rounded-lg bg-background text-xs font-medium",
  {
    variants: {
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      disabled: false,
    },
  },
);

const modeOptionVariants = cva(
  // Base mode option styles
  "px-2 py-1 rounded cursor-pointer transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "",
      },
      disabled: {
        true: "cursor-not-allowed",
        false: "cursor-pointer",
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  },
);

/**
 * ConversationModeToggleDisplay component renders a toggle switch for selecting between
 * Manual and Auto conversation modes. Now enhanced with Tailwind utilities while preserving
 * all original functionality and visual states. Provides visual feedback for the current mode state
 * and supports disabled state for contexts where mode switching is not available.
 *
 * Visual States:
 * - Manual mode active: "Manual" highlighted with primary background, "Auto" normal
 * - Auto mode active: "Auto" highlighted with primary background, "Manual" normal
 * - Disabled state: Entire toggle shown with reduced opacity (0.6)
 */
export function ConversationModeToggleDisplay({
  currentMode,
  disabled = false,
  className = "",
}: ConversationModeToggleDisplayProps) {
  return (
    <div className={cn(modeToggleContainerVariants({ disabled }), className)}>
      <span
        className={cn(
          modeOptionVariants({
            active: currentMode === "manual",
            disabled,
          }),
        )}
      >
        Manual
      </span>
      <span
        className={cn(
          modeOptionVariants({
            active: currentMode === "auto",
            disabled,
          }),
        )}
      >
        Auto
      </span>
    </div>
  );
}
