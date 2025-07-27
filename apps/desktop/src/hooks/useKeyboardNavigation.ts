import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type KeyboardEvent,
} from "react";
import type { KeyboardNavigationOptions } from "./types/KeyboardNavigationOptions";
import type { KeyboardNavigationReturn } from "./types/KeyboardNavigationReturn";

/**
 * Mapping of keyboard keys to navigation actions
 */
const KEY_MAPPINGS = {
  ArrowDown: "next",
  ArrowUp: "previous",
  Home: "first",
  End: "last",
  Enter: "activate",
  " ": "activate", // Space key
} as const;

type NavigationAction = (typeof KEY_MAPPINGS)[keyof typeof KEY_MAPPINGS];

/**
 * Custom hook for implementing keyboard navigation in lists and menus.
 * Provides arrow key navigation, Home/End jumping, and Enter/Space activation.
 *
 * @param options Configuration options for keyboard navigation
 * @returns Navigation state and event handlers
 */
export function useKeyboardNavigation({
  items,
  activeItem,
  onItemChange,
  onItemActivate,
  loop = true,
  disabled = false,
}: KeyboardNavigationOptions): KeyboardNavigationReturn {
  // Initialize focused index based on active item
  const initialFocusedIndex = useMemo(() => {
    const index = items.indexOf(activeItem);
    return index >= 0 ? index : 0;
  }, [items, activeItem]);

  const [focusedIndex, setFocusedIndex] = useState(initialFocusedIndex);

  // Update focused index when active item changes externally
  useEffect(() => {
    const newIndex = items.indexOf(activeItem);
    if (newIndex >= 0 && newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
    }
  }, [activeItem, items]); // Remove focusedIndex from deps to avoid interference

  // Ensure focused index stays within bounds when items change
  useEffect(() => {
    if (items.length === 0) {
      setFocusedIndex(0);
    } else if (focusedIndex >= items.length) {
      setFocusedIndex(items.length - 1);
    } else if (focusedIndex < 0) {
      setFocusedIndex(0);
    }
  }, [items.length, focusedIndex]);

  /**
   * Calculate next index based on current index and navigation action
   */
  const getNextIndex = useCallback(
    (currentIndex: number, action: NavigationAction): number => {
      if (items.length === 0) return 0;

      switch (action) {
        case "next":
          if (currentIndex >= items.length - 1) {
            return loop ? 0 : currentIndex;
          }
          return currentIndex + 1;

        case "previous":
          if (currentIndex <= 0) {
            return loop ? items.length - 1 : currentIndex;
          }
          return currentIndex - 1;

        case "first":
          return 0;

        case "last":
          return items.length - 1;

        default:
          return currentIndex;
      }
    },
    [items.length, loop],
  );

  /**
   * Handle keyboard events for navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled || items.length === 0) {
        return;
      }

      const action = KEY_MAPPINGS[event.key as keyof typeof KEY_MAPPINGS];

      if (!action) {
        return; // Let non-navigation keys bubble up
      }

      // Prevent default browser behavior for handled keys
      event.preventDefault();
      event.stopPropagation();

      if (action === "activate") {
        // Activate current focused item
        const focusedItem = items[focusedIndex];
        if (focusedItem) {
          if (onItemActivate) {
            onItemActivate(focusedItem);
          } else {
            // Fallback to change if no activate handler
            onItemChange(focusedItem);
          }
        }
      } else {
        // Navigate to different item
        const nextIndex = getNextIndex(focusedIndex, action);

        if (nextIndex !== focusedIndex) {
          setFocusedIndex(nextIndex);

          // Update active item when navigating
          const nextItem = items[nextIndex];
          if (nextItem) {
            onItemChange(nextItem);
          }
        }
      }
    },
    [disabled, items, focusedIndex, getNextIndex, onItemChange, onItemActivate],
  );

  return {
    handleKeyDown,
    focusedIndex,
    setFocusedIndex,
  };
}
