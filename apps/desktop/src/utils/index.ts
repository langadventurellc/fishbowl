/**
 * Barrel file for utilities.
 * Re-exports all utility functions and hooks.
 */

export { announceToScreenReader } from "./announceToScreenReader";
export { applyTheme } from "./applyTheme";
export { generateDialogAriaIds } from "./generateDialogAriaIds";
export { getAccessibleDescription } from "./getAccessibleDescription";
export { isScrolledToBottom } from "./isScrolledToBottom";
export { maskApiKey, isMaskedApiKey } from "./maskApiKey";
export { useAccessibilityAnnouncements } from "./useAccessibilityAnnouncements";
export { truncateDescription } from "./truncateDescription";
export type { DialogAriaAttributes } from "./types";
