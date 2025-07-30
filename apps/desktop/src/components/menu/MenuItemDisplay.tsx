import { MenuItemDisplayProps } from "@fishbowl-ai/shared";
import { cn } from "@/lib/utils";

/**
 * MenuItemDisplay Component
 *
 * Reusable menu item component that renders individual menu items with consistent
 * styling and interactive states. Used throughout the application's menu systems
 * including context menus, dropdown menus, and navigation menus.
 *
 * Features:
 * - Multiple visual states (normal, hover, disabled, danger)
 * - Icon support with proper alignment
 * - Theme-aware styling using Tailwind utilities
 * - Separator support for visual grouping
 * - Accessibility-friendly hover and focus states
 * - Danger variant for destructive actions
 */
export function MenuItemDisplay({
  label,
  icon,
  disabled,
  variant = "normal",
  separator = false,
  className,
}: MenuItemDisplayProps) {
  // Base menu item classes using Tailwind utilities
  const getMenuItemClasses = () => {
    return cn(
      // Base menu item styles
      "block w-full px-3 py-2 text-description text-popover-foreground bg-transparent border-none rounded cursor-pointer text-left transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis",
      // Variant-specific styling
      {
        // Normal variant with hover states (only when not disabled)
        "hover:bg-accent hover:text-accent-foreground":
          variant === "normal" && !disabled,

        // Hover variant (always shows hover state)
        "bg-accent text-accent-foreground": variant === "hover",

        // Disabled variant or disabled prop
        "opacity-50 cursor-not-allowed": variant === "disabled" || disabled,

        // Danger variant with hover states (only when not disabled)
        "text-destructive hover:bg-accent hover:text-accent-foreground":
          variant === "danger" && !disabled,
      },
    );
  };

  return (
    <div className={className}>
      <div className={getMenuItemClasses()}>
        {icon && <span className="mr-2 text-xs">{icon}</span>}
        {label}
      </div>
      {separator && <div className="h-px bg-border my-1" />}
    </div>
  );
}
