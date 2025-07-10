/**
 * Convenience function to check if system theme detection is supported
 */

import { systemThemeDetector } from './systemThemeDetectorInstance';

export const isSystemThemeSupported = (): boolean => {
  return systemThemeDetector.isSupported();
};
