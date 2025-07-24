import { ContextMenuItem, ContextMenuDisplayProps } from "@fishbowl-ai/shared";

/**
 * ContextMenuDisplay Component
 *
 * Visual representation of dropdown context menus extracted from DesignPrototype.tsx.
 * Focuses on pure visual display with proper positioning, styling, and theming
 * using CSS custom properties from the claymorphism theme system.
 *
 * Features:
 * - Above/below positioning with proper margins
 * - Theme-aware styling using CSS custom properties
 * - Visual states for menu items (normal, hover, disabled)
 * - Proper z-index layering and shadow effects
 * - Exact visual match with DesignPrototype context menu appearance
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

  // Base menu styles extracted from DesignPrototype contextMenu object
  const getMenuStyles = () => {
    const baseStyles = {
      position: "absolute" as const,
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      padding: "4px",
      minWidth: "140px",
      zIndex: 1000,
    };

    // Position-specific styles from contextMenu and contextMenuAbove objects
    if (position === "above") {
      return {
        ...baseStyles,
        bottom: "100%",
        right: "0",
        marginBottom: "4px",
      };
    }

    return {
      ...baseStyles,
      top: "100%",
      right: "0",
    };
  };

  // Menu item styles extracted from DesignPrototype contextMenuItem object
  const getMenuItemStyles = (item: ContextMenuItem) => {
    const baseStyles = {
      display: "block",
      width: "100%",
      padding: "8px 12px",
      fontSize: "13px",
      color: "var(--popover-foreground)",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      textAlign: "left" as const,
      transition: "background-color 0.15s",
    };

    // Apply disabled styling if item is disabled
    if (item.disabled) {
      return {
        ...baseStyles,
        opacity: 0.5,
        cursor: "not-allowed",
      };
    }

    return baseStyles;
  };

  // Hover styles extracted from DesignPrototype contextMenuItemHover object
  const getHoverStyles = () => ({
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  });

  return (
    <div style={getMenuStyles()} className={className}>
      {items.map((item, index) => (
        <button
          key={`${item.action}-${index}`}
          style={getMenuItemStyles(item)}
          disabled={item.disabled}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              const target = e.currentTarget;
              const hoverStyles = getHoverStyles();
              target.style.backgroundColor = hoverStyles.backgroundColor;
              target.style.color = hoverStyles.color;
            }
          }}
          onMouseLeave={(e) => {
            if (!item.disabled) {
              const target = e.currentTarget;
              target.style.backgroundColor = "transparent";
              target.style.color = "var(--popover-foreground)";
            }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
