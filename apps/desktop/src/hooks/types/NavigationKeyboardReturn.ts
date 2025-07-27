import type { KeyboardEvent } from "react";
import type { FlatNavigationItem } from "./FlatNavigationItem";

/**
 * Return interface for navigation keyboard hook
 */
export interface NavigationKeyboardReturn {
  /** Event handler for keyboard events */
  handleKeyDown: (event: KeyboardEvent) => void;
  /** Current focused item index in flattened list */
  focusedIndex: number;
  /** Manually set focused index */
  setFocusedIndex: (index: number) => void;
  /** Get flattened navigation items for rendering */
  getFlatItems: () => FlatNavigationItem[];
  /** Check if an item should be focused */
  isItemFocused: (itemId: string, type: "section" | "subtab") => boolean;
}
