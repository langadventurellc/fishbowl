import { ContextMenuItem, MenuItemVariant } from "@fishbowl-ai/shared";

/**
 * Props interface for the MenuItemDisplay component.
 *
 * Extends the base ContextMenuItem interface with display-specific properties
 * for pure visual representation without interactive functionality.
 */
interface MenuItemDisplayProps extends ContextMenuItem {
  /**
   * Visual variant to display the menu item in.
   * Controls which visual state is shown for demonstration purposes.
   */
  variant?: MenuItemVariant;

  /**
   * Whether to show a separator line below this menu item.
   * Used for visual grouping of menu items in display.
   */
  separator?: boolean;

  /**
   * Optional CSS class name for additional styling.
   * Applied to the root div element of the component.
   */
  className?: string;
}

/**
 * MenuItemDisplay Component
 *
 * Pure visual representation of individual menu items extracted from DesignPrototype.tsx.
 * Focuses on displaying different visual states (normal, hover, disabled, danger)
 * without any interactive functionality or click handlers.
 *
 * Features:
 * - Visual state variants for demonstration purposes
 * - Icon support with proper alignment
 * - Typography and spacing matching DesignPrototype
 * - Theme-aware styling using CSS custom properties
 * - Separator support for visual grouping
 * - Danger state for destructive actions
 */
export function MenuItemDisplay({
  label,
  icon,
  disabled,
  variant = "normal",
  separator = false,
  className,
}: MenuItemDisplayProps) {
  // Base menu item styles extracted from DesignPrototype contextMenuItem (lines 551-563)
  const getBaseStyles = () => ({
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
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box" as const,
  });

  // Get variant-specific styles based on variant prop and disabled state
  const getVariantStyles = () => {
    const baseStyles = getBaseStyles();

    // If disabled prop is true, always show disabled styling regardless of variant
    if (disabled) {
      return {
        ...baseStyles,
        opacity: 0.5,
        cursor: "not-allowed",
      };
    }

    switch (variant) {
      case "hover":
        // From DesignPrototype contextMenuItemHover (lines 564-567)
        return {
          ...baseStyles,
          backgroundColor: "var(--accent)",
          color: "var(--accent-foreground)",
        };
      case "disabled":
        // From DesignPrototype contextMenuItemDisabled (lines 568-571)
        return {
          ...baseStyles,
          opacity: 0.5,
          cursor: "not-allowed",
        };
      case "danger":
        // Custom danger styling for destructive actions
        return {
          ...baseStyles,
          color: "var(--destructive)",
          backgroundColor: "transparent",
        };
      default:
        return baseStyles;
    }
  };

  return (
    <div className={className}>
      <div
        style={getVariantStyles()}
        onMouseEnter={(e) => {
          if ((variant === "normal" || variant === "danger") && !disabled) {
            const target = e.currentTarget;
            target.style.backgroundColor = "var(--accent)";
            target.style.color = "var(--accent-foreground)";
          }
        }}
        onMouseLeave={(e) => {
          if ((variant === "normal" || variant === "danger") && !disabled) {
            const target = e.currentTarget;
            target.style.backgroundColor = "transparent";
            target.style.color =
              variant === "danger"
                ? "var(--destructive)"
                : "var(--popover-foreground)";
          }
        }}
      >
        {icon && (
          <span style={{ marginRight: "8px", fontSize: "12px" }}>{icon}</span>
        )}
        {label}
      </div>
      {separator && (
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--border)",
            margin: "4px 0",
          }}
        />
      )}
    </div>
  );
}
