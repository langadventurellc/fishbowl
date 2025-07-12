/**
 * Global object properties checked during platform detection
 */
export const PLATFORM_GLOBALS = {
  /** Electron API global property name */
  ELECTRON_API: 'electronAPI',
  /** Capacitor global property name */
  CAPACITOR_API: 'Capacitor',
  /** Navigator API property name */
  NAVIGATOR_API: 'navigator',
  /** Window object property name */
  WINDOW_API: 'window',
  /** Process object property name (Node.js) */
  PROCESS_API: 'process',
} as const;
