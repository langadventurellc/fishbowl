import { MenuTriggerDisplayProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";

/**
 * MenuTriggerDisplay Component
 *
 * Reusable menu trigger component that renders ellipsis button triggers for
 * activating dropdown menus and context menus throughout the application.
 * Provides consistent styling and interactive states across all menu systems.
 *
 * Features:
 * - Multiple visual states (normal, hover, active, disabled)
 * - Theme-aware styling using Tailwind utilities
 * - Flexible positioning and sizing options
 * - Accessibility-friendly interactive states
 * - Consistent ellipsis character rendering
 */
export function MenuTriggerDisplay({
  variant = "normal",
  position = "relative",
  size = "medium",
  className = "",
}: MenuTriggerDisplayProps) {
  // Get Tailwind classes for the menu trigger
  const getTriggerClasses = () => {
    return cn(
      // Base styles - equivalent to baseStyle object
      "bg-transparent border-0 text-muted-foreground rounded text-sm ml-2 transition-all duration-150 min-w-5 min-h-5 flex items-center justify-center",
      // Position styling
      {
        relative: position === "relative",
        absolute: position === "absolute",
      },
      // Size-based padding
      {
        "px-1 py-0.5": size === "small", // 2px 4px
        "px-1.5 py-1": size === "medium", // 4px 6px
      },
      // Cursor based on variant
      {
        "cursor-pointer": variant !== "disabled",
        "cursor-not-allowed": variant === "disabled",
      },
      // Variant-specific styling
      {
        // Normal variant - 0.6 opacity
        "opacity-60": variant === "normal",

        // Hover and active variants - full opacity + background
        "opacity-100 bg-muted": variant === "hover" || variant === "active",

        // Disabled variant - 0.3 opacity
        "opacity-30": variant === "disabled",
      },
      className,
    );
  };

  return <div className={getTriggerClasses()}>⋯</div>;
}
