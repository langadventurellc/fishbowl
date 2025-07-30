/**
 * Type definitions for grid navigation utilities.
 *
 * @module utils/gridNavigationTypes
 */

/**
 * Configuration options for grid navigation behavior.
 */
export interface GridNavigationOptions {
  /** Total number of items in the grid */
  totalItems: number;
  /** Number of columns in the grid layout */
  columns: number;
  /** Callback when focus changes to a new item */
  onFocusChange: (index: number) => void;
  /** Optional callback when an item is activated (Enter/Space) */
  onActivate?: (index: number) => void;
  /** Optional function to announce changes to screen readers */
  announceToScreenReader?: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void;
  /** Optional callback to get item name for announcements */
  getItemName?: (index: number) => string;
}
