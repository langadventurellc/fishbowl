import React from "react";
import { ButtonProps } from "@fishbowl-ai/shared";

/**
 * Button component supporting multiple variants extracted from DesignPrototype.
 *
 * Unified button component that supports 4 variants (primary, secondary, ghost, toggle)
 * with consistent styling, accessibility features, and theme-aware colors.
 * Each variant serves different use cases within the conversation UI system.
 */
export function Button({
  variant,
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className,
  type = "button",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const getBaseStyles = () =>
    ({
      border: "none",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-sans)",
      fontWeight: "500",
      transition: "all 0.15s",
      opacity: disabled ? 0.5 : 1,
      gap: icon && children ? "8px" : "0",
      ...(className && { className }),
    }) as const;

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          height: "32px",
          padding:
            variant === "ghost"
              ? "6px 12px"
              : variant === "toggle"
                ? "6px"
                : "6px 12px",
          borderRadius: "6px",
          fontSize: "14px",
          minWidth: variant === "toggle" ? "32px" : "auto",
          width: variant === "toggle" ? "32px" : "auto",
        };
      case "large":
        return {
          height: "48px",
          padding:
            variant === "ghost"
              ? "12px 20px"
              : variant === "toggle"
                ? "12px"
                : "12px 20px",
          borderRadius: "8px",
          fontSize: "16px",
          minWidth: variant === "toggle" ? "48px" : "auto",
          width: variant === "toggle" ? "48px" : "auto",
        };
      default: // medium
        return {
          height: "40px",
          padding:
            variant === "ghost"
              ? "8px 16px"
              : variant === "toggle"
                ? "8px"
                : "8px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          minWidth: variant === "toggle" ? "40px" : "auto",
          width: variant === "toggle" ? "40px" : "auto",
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        };
      case "secondary":
        return {
          backgroundColor: "var(--secondary)",
          color: "var(--secondary-foreground)",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--popover-foreground)",
        };
      case "toggle":
        return {
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
        };
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    switch (variant) {
      case "primary":
        e.currentTarget.style.opacity = "0.9";
        break;
      case "secondary":
        e.currentTarget.style.opacity = "0.8";
        break;
      case "ghost":
        e.currentTarget.style.backgroundColor = "var(--accent)";
        e.currentTarget.style.color = "var(--accent-foreground)";
        break;
      case "toggle":
        e.currentTarget.style.backgroundColor = "var(--primary)";
        e.currentTarget.style.color = "var(--primary-foreground)";
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    switch (variant) {
      case "primary":
        e.currentTarget.style.opacity = "1";
        break;
      case "secondary":
        e.currentTarget.style.opacity = "1";
        break;
      case "ghost":
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = "var(--popover-foreground)";
        break;
      case "toggle":
        e.currentTarget.style.backgroundColor = "var(--muted)";
        e.currentTarget.style.color = "var(--muted-foreground)";
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const styles = {
    ...getBaseStyles(),
    ...getSizeStyles(),
    ...getVariantStyles(),
  };

  return (
    <button
      type={type}
      style={styles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
    >
      {loading ? (
        <span style={{ animation: "pulse 2s infinite" }}>⏳</span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </button>
  );
}
