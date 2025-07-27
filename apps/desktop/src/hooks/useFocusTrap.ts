/**
 * Hook for managing focus trapping within modal dialogs.
 *
 * Implements comprehensive focus management including focus containment,
 * initial focus placement, and focus restoration according to WCAG 2.1
 * accessibility guidelines. Handles dynamic content changes and provides
 * graceful error handling for edge cases.
 *
 * @module hooks/useFocusTrap
 */

import { useRef, useEffect, useCallback } from "react";
import type { FocusTrapOptions } from "./types/FocusTrapOptions";
import type { FocusTrapReturn } from "./types/FocusTrapReturn";

/**
 * Selector for finding focusable elements within a container.
 * Includes standard interactive elements while excluding disabled elements.
 */
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "[href]:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(", ");

/**
 * Custom hook that manages focus trapping within a container element.
 *
 * Provides focus containment for modal dialogs by preventing Tab navigation
 * from escaping the container boundaries. Handles initial focus placement,
 * focus restoration, and dynamic content changes.
 *
 * @param options Configuration options for the focus trap
 * @returns Object containing container ref and focus management functions
 *
 * @example
 * ```typescript
 * function Modal({ isOpen, onClose }) {
 *   const { containerRef, setInitialFocus } = useFocusTrap({
 *     isActive: isOpen,
 *     restoreFocus: true,
 *     initialFocusSelector: '[data-initial-focus]'
 *   });
 *
 *   return (
 *     <div ref={containerRef}>
 *       <button data-initial-focus onClick={onClose}>Close</button>
 *       <input type="text" placeholder="Enter text..." />
 *       <button>Save</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap(options: FocusTrapOptions): FocusTrapReturn {
  const { isActive, restoreFocus = true, initialFocusSelector } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const initialFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Finds all focusable elements within the container.
   * Memoized to avoid repeated DOM queries when container content doesn't change.
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) {
      return [];
    }

    try {
      const elements =
        containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      return Array.from(elements).filter((element): element is HTMLElement => {
        // Additional check for visibility and accessibility
        const htmlElement = element as HTMLElement;
        const style = window.getComputedStyle(htmlElement);

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          htmlElement.offsetParent !== null &&
          !htmlElement.hasAttribute("inert")
        );
      });
    } catch {
      console.warn("Error finding focusable elements");
      return [];
    }
  }, []);

  /**
   * Sets the initial focus element programmatically.
   * Validates that the element is within the container before storing.
   */
  const setInitialFocus = useCallback((element: HTMLElement | null) => {
    if (!element) {
      initialFocusRef.current = null;
      return;
    }

    // Validate element is within container
    if (containerRef.current?.contains(element)) {
      initialFocusRef.current = element;
    } else {
      console.warn(
        "Initial focus element is not within the focus trap container",
      );
    }
  }, []);

  /**
   * Handles Tab and Shift+Tab key navigation within the container.
   * Prevents focus from escaping and cycles through focusable elements.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        // Prevent Tab when no focusable elements
        event.preventDefault();
        return;
      }

      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement,
      );

      // Handle case where current element is not in our list
      if (currentIndex === -1) {
        event.preventDefault();
        focusableElements[0]?.focus();
        return;
      }

      if (event.shiftKey) {
        // Shift+Tab: move to previous element or wrap to last
        event.preventDefault();
        const previousIndex =
          currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[previousIndex]?.focus();
      } else {
        // Tab: move to next element or wrap to first
        event.preventDefault();
        const nextIndex =
          currentIndex === focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex]?.focus();
      }
    },
    [getFocusableElements],
  );

  /**
   * Sets up focus trap when activated and handles cleanup when deactivated.
   * Manages focus storage, initial focus placement, and event listeners.
   */
  useEffect(() => {
    if (!isActive) {
      return;
    }

    // Store the currently focused element for restoration
    if (restoreFocus && document.activeElement instanceof HTMLElement) {
      previousFocusRef.current = document.activeElement;
    }

    // Set initial focus
    const setInitialFocusElement = () => {
      if (!containerRef.current) {
        return;
      }

      let elementToFocus: HTMLElement | null = null;

      // Priority 1: Element set via setInitialFocus
      if (initialFocusRef.current) {
        elementToFocus = initialFocusRef.current;
      }
      // Priority 2: Element matching initialFocusSelector
      else if (initialFocusSelector) {
        try {
          elementToFocus =
            containerRef.current.querySelector(initialFocusSelector);
        } catch {
          console.warn("Invalid initial focus selector:", initialFocusSelector);
        }
      }
      // Priority 3: First focusable element
      else {
        const focusableElements = getFocusableElements();
        elementToFocus = focusableElements[0] || null;
      }

      if (elementToFocus) {
        try {
          elementToFocus.focus();
        } catch {
          console.warn("Failed to set initial focus");
        }
      }
    };

    // Small delay to ensure DOM is ready and any animations are complete
    const timeoutId = setTimeout(setInitialFocusElement, 0);

    // Add keydown event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element if requested
      if (restoreFocus && previousFocusRef.current) {
        try {
          // Validate the element is still in the DOM and focusable
          if (document.contains(previousFocusRef.current)) {
            previousFocusRef.current.focus();
          }
        } catch {
          console.warn("Failed to restore focus");
        }
        previousFocusRef.current = null;
      }
    };
  }, [
    isActive,
    restoreFocus,
    initialFocusSelector,
    handleKeyDown,
    getFocusableElements,
  ]);

  return {
    containerRef,
    setInitialFocus,
  };
}
