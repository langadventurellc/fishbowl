/**
 * Grid navigation utilities for keyboard accessibility support.
 *
 * @module utils/gridNavigation
 */

import React, { useCallback, useRef } from "react";
import type { GridNavigationOptions } from "./gridNavigationTypes";

/**
 * Handle individual key presses for grid navigation.
 */
const handleNavigationKey = (
  key: string,
  currentIndex: number,
  totalItems: number,
  columns: number,
  getItemName?: (index: number) => string,
) => {
  let newIndex = currentIndex;
  let announcement = "";

  switch (key) {
    case "ArrowRight":
      newIndex = Math.min(currentIndex + 1, totalItems - 1);
      break;
    case "ArrowLeft":
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case "ArrowDown":
      newIndex = Math.min(currentIndex + columns, totalItems - 1);
      break;
    case "ArrowUp":
      newIndex = Math.max(currentIndex - columns, 0);
      break;
    case "Home":
      newIndex = 0;
      announcement = `First item${getItemName ? `: ${getItemName(0)}` : ""}`;
      break;
    case "End":
      newIndex = totalItems - 1;
      announcement = `Last item${getItemName ? `: ${getItemName(totalItems - 1)}` : ""}`;
      break;
  }

  return { newIndex, announcement };
};

/**
 * Create announcement message for navigation.
 */
const createNavigationAnnouncement = (
  index: number,
  totalItems: number,
  getItemName?: (index: number) => string,
  customAnnouncement?: string,
) => {
  if (customAnnouncement) return customAnnouncement;

  const itemName = getItemName?.(index);
  return itemName
    ? `${itemName}, item ${index + 1} of ${totalItems}`
    : `Item ${index + 1} of ${totalItems}`;
};

/**
 * Custom hook for implementing keyboard navigation in grid layouts.
 */
export function useGridNavigation({
  totalItems,
  columns,
  onFocusChange,
  onActivate,
  announceToScreenReader,
  getItemName,
}: GridNavigationOptions) {
  const currentFocusRef = useRef(-1);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      const { newIndex, announcement } = handleNavigationKey(
        e.key,
        currentIndex,
        totalItems,
        columns,
        getItemName,
      );

      // Handle activation keys
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate?.(currentIndex);
        if (announceToScreenReader && getItemName) {
          announceToScreenReader(
            `Activated ${getItemName(currentIndex)}`,
            "polite",
          );
        }
        return;
      }

      // Handle navigation keys
      if (newIndex !== currentIndex) {
        e.preventDefault();
        currentFocusRef.current = newIndex;
        onFocusChange(newIndex);

        if (announceToScreenReader) {
          const message = createNavigationAnnouncement(
            newIndex,
            totalItems,
            getItemName,
            announcement,
          );
          announceToScreenReader(message, "polite");
        }
      }
    },
    [
      totalItems,
      columns,
      onFocusChange,
      onActivate,
      announceToScreenReader,
      getItemName,
    ],
  );

  return { handleKeyDown, currentFocusRef };
}
