/**
 * Enhanced keyboard event handler for slider controls.
 * Provides comprehensive keyboard navigation including arrow keys, Home/End, and Page Up/Down.
 *
 * @module utils/sliderKeyboardHandler
 */

import React from "react";

/**
 * Create keyboard event handler for slider controls with comprehensive navigation.
 */
export const createSliderKeyHandler = (
  currentValue: number,
  min: number,
  max: number,
  step: number,
  onChange: (value: number) => void,
  getDescription?: (value: number) => string,
  announceToScreenReader?: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void,
) => {
  return (e: React.KeyboardEvent) => {
    let newValue = currentValue;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newValue = Math.min(max, currentValue + step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newValue = Math.max(min, currentValue - step);
        break;
      case "Home":
        e.preventDefault();
        newValue = min;
        break;
      case "End":
        e.preventDefault();
        newValue = max;
        break;
      case "PageUp":
        e.preventDefault();
        newValue = Math.min(max, currentValue + step * 5);
        break;
      case "PageDown":
        e.preventDefault();
        newValue = Math.max(min, currentValue - step * 5);
        break;
    }

    if (newValue !== currentValue) {
      onChange(newValue);

      if (announceToScreenReader) {
        const description = getDescription?.(newValue);
        const message = description
          ? `Value set to ${newValue}. ${description}`
          : `Value set to ${newValue}`;
        announceToScreenReader(message, "polite");
      }
    }
  };
};
