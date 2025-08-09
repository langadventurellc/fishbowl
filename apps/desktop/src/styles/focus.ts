/**
 * Focus style constants and utilities for enhanced keyboard navigation.
 *
 * Provides consistent, WCAG 2.1 AA compliant focus indicators with:
 * - 3:1 contrast ratio against backgrounds
 * - 2px minimum thickness for visibility
 * - Theme compatibility (light and dark)
 * - Element-specific focus styles
 * - Accessibility and user preference support
 *
 * @module styles/focus
 */

/**
 * Focus style constants for different element types.
 * Each style ensures WCAG compliance and consistent user experience.
 */
export const FOCUS_STYLES = {
  /**
   * Base focus ring styles for standard interactive elements.
   * Provides 2px ring with proper offset for clear visibility.
   */
  ring: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  /**
   * High contrast focus ring for critical elements like close buttons.
   * Uses 3px ring for enhanced visibility of important controls.
   */
  highContrast:
    "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2",

  /**
   * Focus ring for buttons with enhanced visibility.
   * Uses ring opacity for better contrast against button backgrounds.
   */
  button:
    "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2",

  /**
   * Focus ring for navigation items with accent color.
   * Uses accent color and tighter offset for navigation hierarchy.
   */
  navigation:
    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",

  /**
   * Focus outline for form elements with subtle styling.
   * Uses ring opacity and smaller offset for form layouts.
   */
  form: "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1",
} as const;

/**
 * Get focus classes for a specific element type with disability handling.
 *
 * @param variant - The focus style variant to apply
 * @param disabled - Whether the element is disabled (removes focus indicators)
 * @returns Tailwind CSS classes for focus styling
 *
 * @example
 * ```tsx
 * // Standard navigation focus
 * className={cn("base-styles", getFocusClasses('navigation'))}
 *
 * // High contrast for critical buttons
 * className={cn("button-styles", getFocusClasses('highContrast'))}
 *
 * // Disabled element (no focus)
 * className={cn("button-styles", getFocusClasses('button', true))}
 * ```
 */
export const getFocusClasses = (
  variant: keyof typeof FOCUS_STYLES,
  disabled?: boolean,
) => {
  if (disabled) return "focus-visible:ring-0";
  return FOCUS_STYLES[variant];
};

/**
 * Enhanced focus utility for navigation items with active state handling.
 *
 * Provides specialized focus styling for navigation components that need
 * to differentiate between focused and active states.
 *
 * @param active - Whether the navigation item is currently active
 * @param disabled - Whether the navigation item is disabled
 * @returns Tailwind CSS classes for navigation focus styling
 *
 * @example
 * ```tsx
 * // Active navigation item with enhanced focus
 * className={cn("nav-base", getNavigationFocus(true))}
 *
 * // Inactive navigation item with standard focus
 * className={cn("nav-base", getNavigationFocus(false))}
 * ```
 */
export const getNavigationFocus = (active?: boolean, disabled?: boolean) => {
  if (disabled) return "focus-visible:ring-0";

  const baseFocus = FOCUS_STYLES.navigation;

  // Enhanced focus for active items to distinguish from inactive focused items
  if (active) {
    return `${baseFocus} focus-visible:ring-accent focus-visible:ring-3`;
  }

  return baseFocus;
};

/**
 * Enhanced focus utility for buttons with size and variant handling.
 *
 * Provides specialized focus styling for button components with different
 * sizes and visual importance levels.
 *
 * @param variant - Button visual importance ('primary', 'secondary', 'ghost')
 * @param size - Button size for focus ring scaling ('sm', 'default', 'lg')
 * @param disabled - Whether the button is disabled
 * @returns Tailwind CSS classes for button focus styling
 *
 * @example
 * ```tsx
 * // Primary button with standard focus
 * className={cn("btn-primary", getButtonFocus('primary'))}
 *
 * // Small secondary button with adjusted focus
 * className={cn("btn-secondary", getButtonFocus('secondary', 'sm'))}
 *
 * // Disabled ghost button (no focus)
 * className={cn("btn-ghost", getButtonFocus('ghost', 'default', true))}
 * ```
 */
export const getButtonFocus = (
  variant: "primary" | "secondary" | "ghost" = "primary",
  size: "sm" | "default" | "lg" = "default",
  disabled?: boolean,
) => {
  if (disabled) return "focus-visible:ring-0";

  // Base focus with enhanced visibility for primary actions
  if (variant === "primary") {
    return size === "sm"
      ? "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      : "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  }

  // Standard focus for secondary and ghost buttons
  return FOCUS_STYLES.button;
};

/**
 * Common focus utility classes that can be applied broadly.
 * These provide consistent baseline focus behavior across the application.
 */
export const COMMON_FOCUS_CLASSES = {
  /**
   * Remove default browser focus outline.
   * Should always be paired with custom focus indicators.
   */
  removeOutline: "focus-visible:outline-none",

  /**
   * Ensure focus indicators work with background changes.
   * Useful for elements with dynamic backgrounds.
   */
  backgroundOffset: "focus-visible:ring-offset-background",

  /**
   * Enhanced focus opacity for better visibility.
   * Useful when focus indicators need to stand out more.
   */
  enhancedOpacity: "focus-visible:opacity-100",

  /**
   * Focus transition for smooth focus indicator changes.
   * Improves user experience with animated focus states.
   */
  transition: "transition-all duration-200 ease-in-out",
} as const;
