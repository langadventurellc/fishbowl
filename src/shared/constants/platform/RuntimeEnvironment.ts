/**
 * Runtime environments available for platform detection
 *
 * @enum {string}
 */
export enum RuntimeEnvironment {
  /** Main Electron process (Node.js) */
  MAIN = 'main',
  /** Electron renderer process (Chromium) */
  RENDERER = 'renderer',
  /** Capacitor native container */
  NATIVE = 'native',
  /** Standard web browser */
  BROWSER = 'browser',
}
