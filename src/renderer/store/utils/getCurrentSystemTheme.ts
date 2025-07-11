/**
 * Convenience function to get current system theme
 */

import { systemThemeDetector } from './systemThemeDetectorInstance';

export const getCurrentSystemTheme = (): 'light' | 'dark' => {
  return systemThemeDetector.getCurrentSystemTheme();
};
