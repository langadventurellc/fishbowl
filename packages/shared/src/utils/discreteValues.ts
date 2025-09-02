/**
 * Discrete value utilities for the personality system
 *
 * Provides constants, types, and utility functions for working with
 * discrete values (0, 20, 40, 60, 80, 100) used in personality traits.
 */

// Constants
export const DISCRETE_VALUES = [0, 20, 40, 60, 80, 100] as const;
export const DISCRETE_STEP = 20;
export const DISCRETE_VALUE_SET = new Set(DISCRETE_VALUES);

// Types
export type DiscreteValue = (typeof DISCRETE_VALUES)[number];

/**
 * Snaps a continuous value to the nearest discrete value.
 * Halfway values round up (e.g., 30→40, 50→60).
 * Values outside 0-100 are clamped to bounds.
 *
 * @param value - The input value to snap
 * @returns The nearest discrete value
 */
export const snapToNearestDiscrete = (value: number): DiscreteValue => {
  // Clamp value to 0-100 range
  const clamped = Math.min(100, Math.max(0, value));

  // Calculate index using Math.round which rounds 0.5 up
  const index = Math.round(clamped / DISCRETE_STEP);

  return DISCRETE_VALUES[index] as DiscreteValue;
};

/**
 * Type guard to check if a value is a valid discrete value.
 *
 * @param value - The value to check
 * @returns True if the value is a discrete value
 */
export const isDiscreteValue = (value: number): value is DiscreteValue => {
  return DISCRETE_VALUE_SET.has(value as DiscreteValue);
};

/**
 * Converts a continuous value to a discrete value.
 * This is an alias for snapToNearestDiscrete for clarity in conversion contexts.
 *
 * @param value - The input value to convert
 * @returns The nearest discrete value
 */
export const convertToDiscreteValue = (value: number): DiscreteValue => {
  return snapToNearestDiscrete(value);
};
