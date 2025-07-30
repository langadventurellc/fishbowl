import { cn } from "@/lib/utils";
import {
  ContextMenuDisplayProps,
  ContextMenuItem,
} from "@fishbowl-ai/ui-shared";

/**
 * ContextMenuDisplay Component
 *
 * Reusable context menu component that renders dropdown menus with proper
 * positioning and styling. Used throughout the application for right-click
 * context menus, dropdown actions, and overflow menus.
 *
 * Features:
 * - Flexible above/below positioning with automatic margins
 * - Theme-aware styling using CSS custom properties
 * - Interactive states for menu items (normal, hover, disabled)
 * - Proper z-index layering and shadow effects
 * - Keyboard and mouse accessibility support
 */
export function ContextMenuDisplay({
  isOpen,
  position,
  items,
  className,
}: ContextMenuDisplayProps) {
  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Base menu container styles using Tailwind utilities
  const baseMenuClasses =
    "absolute bg-popover border border-border rounded-md shadow-lg p-1 min-w-[140px] z-[1000]";

  // Position-specific classes for above/below menu positioning
  const positionClasses =
    position === "above" ? "bottom-full right-0 mb-1" : "top-full right-0";

  // Menu item base classes with interactive states
  const getMenuItemClasses = (item: ContextMenuItem) => {
    return cn(
      // Base menu item styles
      "block w-full px-3 py-2 text-sm text-popover-foreground bg-transparent border-none rounded cursor-pointer text-left transition-colors duration-150",
      // Hover state (only for non-disabled items)
      !item.disabled && "hover:bg-accent hover:text-accent-foreground",
      // Disabled state styling
      item.disabled && "opacity-50 cursor-not-allowed",
    );
  };

  return (
    <div className={cn(baseMenuClasses, positionClasses, className)}>
      {items.map((item, index) => (
        <button
          key={`${item.action}-${index}`}
          className={getMenuItemClasses(item)}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
