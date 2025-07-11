/**
 * System theme detection manager class
 *
 * Provides robust system theme detection with proper error handling
 * and cleanup capabilities for the theme management system
 */

/**
 * System theme change event handler type
 */
type SystemThemeChangeHandler = (isDark: boolean) => void;

/**
 * System theme detection manager
 */
export class SystemThemeDetector {
  private mediaQuery: MediaQueryList | null = null;
  private handler: SystemThemeChangeHandler | null = null;
  private boundListener: ((event: MediaQueryListEvent) => void) | null = null;

  /**
   * Check if system theme detection is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && window.matchMedia !== undefined;
  }

  /**
   * Get current system theme preference
   */
  getCurrentSystemTheme(): 'light' | 'dark' {
    if (!this.isSupported()) {
      console.warn('System theme detection not supported, defaulting to light');
      return 'light';
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    } catch (error) {
      console.error('Error detecting system theme:', error);
      return 'light';
    }
  }

  /**
   * Start listening for system theme changes
   */
  startListening(handler: SystemThemeChangeHandler): boolean {
    if (!this.isSupported()) {
      console.warn('System theme detection not supported');
      return false;
    }

    try {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.handler = handler;

      // Create bound listener for proper cleanup
      this.boundListener = (event: MediaQueryListEvent) => {
        if (this.handler) {
          this.handler(event.matches);
        }
      };

      // Add listener
      this.mediaQuery.addEventListener('change', this.boundListener);

      // Call handler with initial value
      handler(this.mediaQuery.matches);

      return true;
    } catch (error) {
      console.error('Error setting up system theme listener:', error);
      return false;
    }
  }

  /**
   * Stop listening for system theme changes
   */
  stopListening(): void {
    if (this.mediaQuery && this.boundListener) {
      try {
        this.mediaQuery.removeEventListener('change', this.boundListener);
      } catch (error) {
        console.error('Error removing system theme listener:', error);
      }
    }

    this.mediaQuery = null;
    this.handler = null;
    this.boundListener = null;
  }

  /**
   * Get media query for testing purposes
   */
  getMediaQuery(): MediaQueryList | null {
    return this.mediaQuery;
  }
}
