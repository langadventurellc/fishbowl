/**
 * Primary platform types supported by the application
 *
 * @enum {string}
 */
export enum PlatformType {
  /** Electron desktop application */
  ELECTRON = 'electron',
  /** Capacitor mobile/native application */
  CAPACITOR = 'capacitor',
  /** Web browser application */
  WEB = 'web',
  /** Unknown or unsupported platform */
  UNKNOWN = 'unknown',
}
