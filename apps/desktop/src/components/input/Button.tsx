import { cn } from "@/lib/utils";
import { ButtonProps } from "@fishbowl-ai/ui-shared";
import { Loader2 } from "lucide-react";
import React from "react";
import { Button as ShadcnButton } from "../ui/button";

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

  // Toggle variant Tailwind classes that override shadcn/ui outline variant
  const toggleClasses =
    variant === "toggle"
      ? [
          // Base toggle styling
          "bg-muted text-muted-foreground border-0",
          // Size-based width and padding
          size === "small"
            ? "min-w-8 w-8 p-1.5"
            : size === "large"
              ? "min-w-12 w-12 p-3"
              : "min-w-10 w-10 p-2",
          // Hover states
          "hover:bg-primary hover:text-primary-foreground hover:border-primary",
        ]
      : [];

  return (
    <ShadcnButton
      variant={variantMap[variant]}
      size={sizeMap[size]}
      type={type}
      className={cn(toggleClasses, className)}
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
