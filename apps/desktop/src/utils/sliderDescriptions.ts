/**
 * Utility functions to generate descriptive text for slider values.
 * Used for screen reader announcements and aria-valuetext attributes.
 *
 * @module utils/sliderDescriptions
 */

export const getSliderDescription = {
  temperature: (value: number): string => {
    if (value < 0.3) return "Very focused and deterministic";
    if (value < 0.7) return "Moderately focused";
    if (value < 1.0) return "Balanced creativity";
    if (value < 1.5) return "Creative and varied";
    return "Highly creative and unpredictable";
  },

  topP: (value: number): string => {
    if (value < 0.5) return "Very focused token selection";
    if (value < 0.9) return "Balanced token diversity";
    return "High token diversity";
  },

  maxTokens: (value: number): string => {
    const words = Math.round(value * 0.75);
    if (value < 500) return `Short responses, approximately ${words} words`;
    if (value < 1500) return `Medium responses, approximately ${words} words`;
    if (value < 3000) return `Long responses, approximately ${words} words`;
    return `Very long responses, approximately ${words} words`;
  },
};
