/**
 * Enhanced keyboard event handler for slider controls.
 * Provides comprehensive keyboard navigation including arrow keys, Home/End, and Page Up/Down.
 *
 * @module utils/sliderKeyboardHandler
 */

import React from "react";

/**
 * Calculate the new slider value based on the key pressed.
 */
const calculateNewValue = (
  key: string,
  currentValue: number,
  min: number,
  max: number,
  step: number,
): number => {
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return Math.min(max, currentValue + step);
    case "ArrowLeft":
    case "ArrowDown":
      return Math.max(min, currentValue - step);
    case "Home":
      return min;
    case "End":
      return max;
    case "PageUp":
      return Math.min(max, currentValue + step * 5);
    case "PageDown":
      return Math.max(min, currentValue - step * 5);
    default:
      return currentValue;
  }
};

/**
 * Announce value changes to screen readers with optional description.
 */
const announceValueChange = (
  newValue: number,
  getDescription?: (value: number) => string,
  announceToScreenReader?: (
    message: string,
    priority?: "polite" | "assertive",
  ) => void,
) => {
  if (announceToScreenReader) {
    const description = getDescription?.(newValue);
    const message = description
      ? `Value set to ${newValue}. ${description}`
      : `Value set to ${newValue}`;
    announceToScreenReader(message, "polite");
  }
};

/**
 * Check if a key should trigger slider navigation.
 */
const isSliderKey = (key: string): boolean => {
  return [
    "ArrowRight",
    "ArrowUp",
    "ArrowLeft",
    "ArrowDown",
    "Home",
    "End",
    "PageUp",
    "PageDown",
  ].includes(key);
};

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
    if (!isSliderKey(e.key)) {
      return;
    }

    e.preventDefault();
    const newValue = calculateNewValue(e.key, currentValue, min, max, step);

    if (newValue !== currentValue) {
      onChange(newValue);
      announceValueChange(newValue, getDescription, announceToScreenReader);
    }
  };
};
