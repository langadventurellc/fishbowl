import React from "react";
import { Loader2 } from "lucide-react";
import { ButtonProps } from "@fishbowl-ai/shared";
import { Button as ShadcnButton } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * Button component wrapper around shadcn/ui Button while preserving all custom variants.
 *
 * This wrapper maintains the existing ButtonProps API while leveraging shadcn/ui Button's
 * production-ready features including Radix UI Slot integration, advanced accessibility,
 * professional dark mode handling, and icon management. All 4 custom variants (primary,
 * secondary, ghost, toggle) are mapped to appropriate shadcn/ui variants with custom
 * overrides where needed.
 */

export function Button({
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  // Map our custom variants to shadcn/ui variants
  const variantMap = {
    primary: "default",
    secondary: "secondary",
    ghost: "ghost",
    toggle: "outline", // Use outline as base, will override with custom styles
  } as const;

  // Map our sizes to shadcn/ui sizes
  const sizeMap = {
    small: "sm",
    medium: "default",
    large: "lg",
  } as const;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  // Custom toggle variant styling that overrides shadcn/ui outline variant
  const toggleStyles =
    variant === "toggle"
      ? {
          backgroundColor: "var(--muted)",
          color: "var(--muted-foreground)",
          border: "none",
          minWidth:
            size === "small" ? "32px" : size === "large" ? "48px" : "40px",
          width: size === "small" ? "32px" : size === "large" ? "48px" : "40px",
          padding: size === "small" ? "6px" : size === "large" ? "12px" : "8px",
        }
      : {};

  const toggleHoverClass =
    variant === "toggle"
      ? "hover:!bg-primary hover:!text-primary-foreground hover:!border-primary"
      : "";

  return (
    <ShadcnButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      type={type}
      className={cn(toggleHoverClass, className)}
      style={toggleStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
        </>
      )}
    </ShadcnButton>
  );
}
