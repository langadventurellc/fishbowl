import { MenuTriggerDisplayProps } from "@fishbowl-ai/shared";

/**
 * MenuTriggerDisplay Component
 *
 * Reusable menu trigger component that renders ellipsis button triggers for
 * activating dropdown menus and context menus throughout the application.
 * Provides consistent styling and interactive states across all menu systems.
 *
 * Features:
 * - Multiple visual states (normal, hover, active, disabled)
 * - Theme-aware styling using CSS custom properties
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
  const getVariantStyles = () => {
    const baseStyle = {
      position: position,
      background: "none",
      border: "none",
      color: "var(--muted-foreground)",
      cursor: variant === "disabled" ? "not-allowed" : "pointer",
      padding: size === "small" ? "2px 4px" : "4px 6px",
      borderRadius: "4px",
      fontSize: "14px",
      marginLeft: "8px",
      transition: "all 0.15s",
      minWidth: "20px",
      minHeight: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };

    switch (variant) {
      case "hover":
      case "active":
        return { ...baseStyle, opacity: 1, backgroundColor: "var(--muted)" };
      case "disabled":
        return { ...baseStyle, opacity: 0.3 };
      default:
        return { ...baseStyle, opacity: 0.6 };
    }
  };

  return (
    <div style={getVariantStyles()} className={className}>
      ⋯
    </div>
  );
}
