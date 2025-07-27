import type { KeyboardEvent } from "react";

/**
 * Return interface for keyboard navigation hook
 */
export interface KeyboardNavigationReturn {
  /** Event handler for keyboard events */
  handleKeyDown: (event: KeyboardEvent) => void;
  /** Current focused item index */
  focusedIndex: number;
  /** Manually set focused index */
  setFocusedIndex: (index: number) => void;
}
