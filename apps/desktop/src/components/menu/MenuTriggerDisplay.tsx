import { MenuTriggerDisplayProps } from "@fishbowl-ai/shared";

/**
 * MenuTriggerDisplay Component
 *
 * Visual representation of ellipsis button triggers extracted from DesignPrototype.tsx.
 * Renders the three-dot ellipsis character (⋯) with proper styling and visual states
 * using CSS custom properties from the claymorphism theme system.
 *
 * Features:
 * - Multiple visual states (normal, hover, active, disabled)
 * - Theme-aware styling using CSS custom properties
 * - Flexbox centering for proper ellipsis character alignment
 * - Exact visual match with DesignPrototype ellipsis button appearance
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
