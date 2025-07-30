/**
 * Focus management utilities for accessibility support.
 *
 * @module utils/focusManagement
 */

import { useCallback } from "react";

/**
 * Custom hook for focus management utilities.
 *
 * Provides functions for focus trapping, finding focusable elements,
 * and managing focus within complex UI components.
 */
export function useFocusManagement() {
  const focusableSelectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="tab"]:not([disabled])',
    '[role="gridcell"]:not([disabled])',
  ].join(", ");

  /**
   * Get all focusable elements within a container.
   */
  const getFocusableElements = useCallback(
    (container: HTMLElement) => {
      return Array.from(
        container.querySelectorAll(focusableSelectors),
      ) as HTMLElement[];
    },
    [focusableSelectors],
  );

  /**
   * Trap focus within a container element.
   * Returns cleanup function to remove event listeners.
   */
  const trapFocus = useCallback(
    (container: HTMLElement) => {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) return () => {};

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return () => {};

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener("keydown", handleKeyDown);
      return () => container.removeEventListener("keydown", handleKeyDown);
    },
    [getFocusableElements],
  );

  /**
   * Focus the first focusable element in a container.
   */
  const focusFirst = useCallback(
    (container: HTMLElement) => {
      const focusableElements = getFocusableElements(container);
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      }
    },
    [getFocusableElements],
  );

  /**
   * Focus management for grid navigation.
   */
  const manageFocus = useCallback(
    (
      elementRefs: (HTMLElement | null)[],
      focusIndex: number,
      announceToScreenReader?: (
        message: string,
        priority?: "polite" | "assertive",
      ) => void,
    ) => {
      if (
        focusIndex >= 0 &&
        focusIndex < elementRefs.length &&
        elementRefs[focusIndex]
      ) {
        elementRefs[focusIndex]?.focus();

        if (announceToScreenReader) {
          announceToScreenReader(
            `Focused item ${focusIndex + 1} of ${elementRefs.length}`,
            "polite",
          );
        }
      }
    },
    [],
  );

  return {
    trapFocus,
    getFocusableElements,
    focusFirst,
    manageFocus,
  };
}
