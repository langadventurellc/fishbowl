/**
 * Utility function to create skip link elements for keyboard navigation.
 * Provides keyboard users quick navigation to main content areas.
 *
 * @module utils/skipLinks
 */

/**
 * Create skip link properties for accessibility navigation.
 */
export const createSkipLink = (targetId: string, label: string) => ({
  href: `#${targetId}`,
  className:
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200",
  onFocus: () => {
    // Announce to screen readers when skip link is focused
    const announceFunction = (
      window as {
        announceToScreenReader?: (
          message: string,
          priority?: "polite" | "assertive",
        ) => void;
      }
    ).announceToScreenReader;
    if (announceFunction) {
      announceFunction(label, "polite");
    }
  },
});
